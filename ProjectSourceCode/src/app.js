const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const {generateToken, hashToken, sendPasswordResetEmail, sendVerificationEmail} = require('./email');
const path = require('path');
const { validateRegistration, validatePassword, loginCredentials } = require('./validation');
const { musicianId, listMusicians, findMusician } = require('./musicians');
const { validateSongLinks, profileWithSongs } = require('./songLinks');

const pages = path.resolve(__dirname, '..', 'pages');
const resources = path.join(__dirname, 'resources');

function createApp(db, { sessionSecret } = {}) {
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set in the environment');
  }

  const app = express();
  app.use('/img', express.static(path.join(resources, 'img')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/css', express.static(path.join(resources, 'css')));
  app.use('/js', express.static(path.join(resources, 'js')));
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  }));

  const requireLogin = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
  };

  app.get('/', (req, res) => res.redirect(req.session.user ? '/discover' : '/login'));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/register', (req, res) => res.sendFile(path.join(pages, 'register_012-2.html')));
  app.get('/login', (req, res) => res.sendFile(path.join(pages, 'login_012-2.html')));
  app.get('/forgot-password', (req, res) => {res.sendFile(path.join(pages, 'forgot_password_012-2.html'));});
  app.get('/reset-password', (req, res) => {res.sendFile(path.join(pages, 'reset_password_012-2.html'));});

  app.get('/home', requireLogin, (req, res) => {
    res.sendFile(path.join(pages, 'home_012-2.html'));
  });

  app.get('/discover', requireLogin, (req, res) => {
    res.sendFile(path.join(pages, 'discover_012-2.html'));
  });

  app.get('/create', requireLogin, (req, res) => {
    res.sendFile(path.join(pages, 'create_012-2.html'));
  });

  app.get('/profile', requireLogin, (req, res) => {
    const file = req.session.user.user_type === 'musician'
      ? 'musicianProfile_012-2.html'
      : 'userProfile_012-2.html';
    return res.sendFile(path.join(pages, file));
  });

  const requireApiLogin = (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Please log in.' });
    next();
  };

  app.get('/api/me', requireApiLogin, (req, res) => res.json(req.session.user));

  app.get('/api/profile', requireApiLogin, async (req, res) => {
    try {
      const profile = await db.oneOrNone(
        `SELECT u.username, u.email, u.user_type, u.avatar_url,
                m.stage_name, m.bio, m.location, m.starting_price, m.song_links
         FROM users u
         LEFT JOIN musician_profiles m ON m.user_id = u.user_id
         WHERE u.user_id = $1`,
        [req.session.user.user_id]
      );
      return res.json(profile && profileWithSongs(profile));
    } catch (error) {
      console.error('Could not load profile:', error.message);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  app.patch('/api/profile', requireApiLogin, async (req, res) => {
    const bio = typeof req.body.bio === 'string' ? req.body.bio.trim() : null;
    if (bio === null) return res.status(400).json({ error: 'Bio must be text.' });
    if (bio.length > 500) {
      return res.status(400).json({ error: 'Bio must be 500 characters or less.' });
    }

    try {
      const updated = await db.oneOrNone(
        'UPDATE musician_profiles SET bio = $1 WHERE user_id = $2 RETURNING bio',
        [bio, req.session.user.user_id]
      );
      if (!updated) return res.status(404).json({ error: 'Musician profile not found.' });
      return res.json({ bio: updated.bio });
    } catch (error) {
      console.error('Could not save bio:', error.message);
      return res.status(500).json({ error: 'Could not save bio.' });
    }
  });

  app.put('/api/profile/songs', requireApiLogin, async (req, res) => {
    const user = req.session.user;
    if (user.user_type !== 'musician') {
      return res.status(403).json({ error: 'Only musicians can edit song links.' });
    }

    const { songs, error } = validateSongLinks(req.body?.links);
    if (error) return res.status(400).json({ error });

    try {
      await db.none(
        `INSERT INTO musician_profiles (user_id, song_links)
         VALUES ($1, $2::text[])
         ON CONFLICT (user_id) DO UPDATE SET song_links = EXCLUDED.song_links`,
        [user.user_id, songs.map(song => song?.url ?? null)]
      );
      return res.json({ songs });
    } catch (error) {
      console.error('Could not save song links:', error.message);
      return res.status(500).json({ error: 'Could not save song links.' });
    }
  });

  app.get('/api/musicians', requireApiLogin, async (req, res) => {
    try {
      const musicians = await listMusicians(db, req.query.search);
      return res.json(musicians);
    } catch (error) {
      console.error('Could not load musicians:', error.message);
      return res.status(500).json({ error: 'Could not load musicians.' });
    }
  });

  app.get('/api/musicians/:id', requireApiLogin, async (req, res) => {
    const id = musicianId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid musician ID.' });
    try {
      const musician = await findMusician(db, id);
      if (!musician) return res.status(404).json({ error: 'Musician not found.' });
      return res.json(profileWithSongs(musician));
    } catch (error) {
      console.error('Could not load musician:', error.message);
      return res.status(500).json({ error: 'Could not load musician.' });
    }
  });

  app.get('/musicians/:id', requireLogin, (req, res) => {
    if (!musicianId(req.params.id)) return res.status(400).send('Invalid musician ID.');
    return res.sendFile(path.join(pages, 'musicianProfile_012-2.html'));
  });

  // Send the user back to the register page with a message to show under one field.
  function registerError(message, field) {
    const params = new URLSearchParams({ error: message });
    if (field) params.set('field', field);
    return '/register?' + params.toString();
  }

  
app.post('/register', async (req, res) => {
  const result = validateRegistration(req.body);
  if (result.error) {
    return res.redirect(registerError(result.error, result.field));
  }

  const { username, email, password, role } = result.data;

  try {
    const hash = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();
    const tokenHash = hashToken(verificationToken);

    await db.tx(async t => {
      const user = await t.one(
        `INSERT INTO users (username, email, password_hash, user_type)
         VALUES ($1, $2, $3, $4)
         RETURNING user_id`,
        [username, email, hash, role]
      );

      if (role === 'musician') {
        await t.none(
          'INSERT INTO musician_profiles (user_id) VALUES ($1)',
          [user.user_id]
        );
      }

      await t.none(
        `INSERT INTO email_verification_tokens
         (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
        [user.user_id, tokenHash]
      );

      await sendVerificationEmail(email, verificationToken);
    });

    return res.redirect('/login?message=verify-email');
  } catch (error) {
    if (error.code === '23505') {
      if (error.constraint && error.constraint.includes('email')) {
        return res.redirect(registerError('An account with that email already exists.', 'email'));
      }
      return res.redirect(registerError('That username is already taken.', 'username'));
    }

    console.error('Registration failed:', error.message);
    return res.redirect(registerError('Something went wrong. Please try again.'));
  }
});


app.get('/verify-email', async (req, res) => {
  const token = req.query.token;

  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).send('Invalid verification link.');
  }

  try {
    const tokenHash = hashToken(token);

    const verified = await db.tx(async t => {
      const record = await t.oneOrNone(
        `SELECT user_id
         FROM email_verification_tokens
         WHERE token_hash = $1 AND expires_at > NOW()
         FOR UPDATE`,
        [tokenHash]
      );

      if (!record) return false;

      await t.none(
        'UPDATE users SET email_verified = TRUE WHERE user_id = $1',
        [record.user_id]
      );

      await t.none(
        'DELETE FROM email_verification_tokens WHERE user_id = $1',
        [record.user_id]
      );

      return true;
    });

    if (!verified) {
      return res.status(400).send('This verification link is invalid or has expired.');
    }

    return res.send(`
      <h2>Email Verified Successfully!</h2>
      <p>Your Reserve Music account is now verified.</p>
      <a href="/login">Continue to Login</a>
    `);
  } catch (error) {
    console.error('Email verification failed:', error.message);
    return res.status(500).send('Something went wrong. Please try again.');
  }
});

app.post('/resend-verification', async (req, res) => {
  const identifier = typeof req.body.identifier === 'string'
    ? req.body.identifier.trim()
    : '';

  try {
    const user = await db.oneOrNone(
      `SELECT user_id, email, email_verified
       FROM users
       WHERE username = $1 OR LOWER(email) = LOWER($1)`,
      [identifier]
    );

    if (user && !user.email_verified) {
      const token = generateToken();
      const tokenHash = hashToken(token);

      await db.tx(async t => {
        // Invalidate previous verification links.
        await t.none(
          'DELETE FROM email_verification_tokens WHERE user_id = $1',
          [user.user_id]
        );

        // Store the new verification token.
        await t.none(
          `INSERT INTO email_verification_tokens
           (user_id, token_hash, expires_at)
           VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
          [user.user_id, tokenHash]
        );
      });

      await sendVerificationEmail(user.email, token);
    }

    return res.sendStatus(200);

  } catch (error) {
    console.error('Verification email resend failed:', error.message);
    return res.sendStatus(500);
  }
});


  app.post('/login', async (req, res) => {
    const credentials = loginCredentials(req.body);
    if (!credentials) return res.redirect('/login?error=missing');

    try {
      const user = await db.oneOrNone(
        'SELECT user_id, username, email, user_type, password_hash, email_verified FROM users WHERE username = $1 OR LOWER(email) = LOWER($1)',
        [credentials.identifier]
      );
      if (!user || !(await bcrypt.compare(credentials.password, user.password_hash))) {
          return res.redirect('/login?error=invalid');
      }

      if (!user.email_verified) {
  return res.redirect(
    `/login?error=unverified&identifier=${encodeURIComponent(credentials.identifier)}`
  );
}

      req.session.regenerate(error => {
        if (error) return res.redirect('/login?error=server');
        req.session.user = {
          user_id: user.user_id,
          username: user.username,
          user_type: user.user_type,
        };
        req.session.save(saveError => {
          if (saveError) return res.redirect('/login?error=server');
          return res.redirect('/discover');
        });
      });
    } catch (error) {
      console.error('Login failed:', error.message);
      return res.redirect('/login?error=server');
    }
  });

  app.post('/forgot-password', async (req, res) => {
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';

  try {
    const user = await db.oneOrNone(
      'SELECT user_id, email FROM users WHERE LOWER(email) = $1',
      [email]
    );

    // Always return the same message, whether the account exists or not.
    if (user) {
      const token = generateToken();
      const tokenHash = hashToken(token);

      await db.tx(async t => {
        // Invalidate any previous reset links for this user.
        await t.none(
          'DELETE FROM password_reset_tokens WHERE user_id = $1',
          [user.user_id]
        );

        await t.none(
          `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
           VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
          [user.user_id, tokenHash]
        );
      });

      await sendPasswordResetEmail(user.email, token);
    }

    return res.send(
      'If an account exists with that email, a password reset link has been sent.'
    );
  } catch (error) {
    console.error('Password reset request failed:', error.message);
    return res.status(500).send('Something went wrong. Please try again.');
  }
});

app.post('/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  // Make sure both password fields match.
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match.');
  }

  // Validate the new password.
  const validation = validatePassword(password);

  if (validation.error) {
    return res.status(400).send(validation.error);
  }

  // Make sure the reset token is valid in format.
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).send('Invalid or expired reset link.');
  }

  try {
    const tokenHash = hashToken(token);

    const success = await db.tx(async t => {
      // Find and lock the token so it cannot be reused.
      const resetToken = await t.oneOrNone(
        `SELECT user_id
         FROM password_reset_tokens
         WHERE token_hash = $1 AND expires_at > NOW()
         FOR UPDATE`,
        [tokenHash]
      );

      if (!resetToken) return false;

      // Hash the new password.
      const passwordHash = await bcrypt.hash(password, 10);

      // Update the user's password.
      await t.none(
        'UPDATE users SET password_hash = $1 WHERE user_id = $2',
        [passwordHash, resetToken.user_id]
      );

      // Invalidate all reset links for this user.
      await t.none(
        'DELETE FROM password_reset_tokens WHERE user_id = $1',
        [resetToken.user_id]
      );

      return true;
    });

    if (!success) {
      return res.status(400).send('Invalid or expired reset link.');
    }

    return res.send(`
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Successful</title>
            <meta http-equiv="refresh" content="3;url=/login">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body class="registration-page">
            <main class="registration-main">
                <div class="registration-content text-center">
                    <div class="alert alert-success" role="alert">
                        Your password has been reset successfully!
                    </div>
                    <p>Redirecting you to the login page...</p>
                    <a href="/login">Click here if you aren't redirected.</a>
                </div>
            </main>
        </body>
    </html>
`);

  } catch (error) {
    console.error('Password reset failed:', error.message);
    return res.status(500).send('Something went wrong. Please try again.');
  }
});

  app.get('/api/reviews', requireApiLogin, async (req, res) => {
    try {
      const reviews = await db.any(
        `SELECT u.username AS customer_name, r.rating, r.comment
         FROM reviews r
         JOIN users u ON u.user_id = r.customer_id
         WHERE r.musician_id = $1
         ORDER BY r.created_at DESC`,
        [req.session.user.user_id]
      );
      return res.json(reviews);
    } catch (error) {
      console.error('Could not load reviews:', error.message);
      return res.status(500).json({ error: 'Could not load reviews.' });
    }
  });
  

  app.get('/logout', requireLogin, (req, res) => {
    req.session.destroy(error => {
      if (error) return res.status(500).send('Logout failed');
      res.clearCookie('connect.sid');
      return res.sendFile(path.join(pages, 'logout_012-2.html'));
    });
  });
  app.get('/welcome', (req, res) => {
    res.json({
      status: 'success',
      message: 'Welcome!'
    });
  });


  app.get('/home_012-2.html', (req, res) => {
    res.redirect('/home');
  });

  app.get('/discover_012-2.html', (req, res) => {
    res.redirect('/discover');
  });

  app.get('/create_012-2.html', (req, res) => {
    res.redirect('/create');
  });

  app.get('/profile.html', (req, res) => {
    res.redirect('/profile');
  });

  return app;
}

module.exports = { createApp };
