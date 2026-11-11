const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const { validateRegistration, loginCredentials } = require('./validation');
const { musicianId, listMusicians, findMusician } = require('./musicians');

const pages = path.resolve(__dirname, '..', 'pages');
const resources = path.join(__dirname, 'resources');

function createApp(db, { sessionSecret } = {}) {
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set in the environment');
  }

  const app = express();
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
  app.get('/discover', requireLogin, (req, res) => res.sendFile(path.join(pages, 'home_012-2.html')));
  app.get('/home', requireLogin, (req, res) => res.redirect('/discover'));
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
                m.stage_name, m.bio, m.location, m.starting_price
         FROM users u
         LEFT JOIN musician_profiles m ON m.user_id = u.user_id
         WHERE u.user_id = $1`,
        [req.session.user.user_id]
      );
      return res.json(profile);
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
      return res.json(musician);
    } catch (error) {
      console.error('Could not load musician:', error.message);
      return res.status(500).json({ error: 'Could not load musician.' });
    }
  });

  app.get('/musicians/:id', requireLogin, (req, res) => {
    if (!musicianId(req.params.id)) return res.status(400).send('Invalid musician ID.');
    return res.sendFile(path.join(pages, 'musicianProfile_012-2.html'));
  });

    app.post('/register', async (req, res) => {
  const result = validateRegistration(req.body);

  if (result.error) {
    return res.redirect('/register?error=' + encodeURIComponent(result.error));
  }

  const { username, email, password, role } = result.data;

  try {
    const hash = await bcrypt.hash(password, 10);

    await db.tx(async t => {
      const user = await t.one(
        `INSERT INTO users (username, email, password_hash, user_type)
         VALUES ($1, $2, $3, $4)
         RETURNING user_id`,
        [username, email, hash, role]
      );

      if (role === 'musician') {
        await t.none('INSERT INTO musician_profiles (user_id) VALUES ($1)', [user.user_id]);
      }
    });

    return res.redirect('/login');
  } catch (error) {
    console.error('Registration failed:', error.message);

    return res.redirect('/register?error=server');
  }
});

    app.post('/login', async (req, res) => {
    const credentials = loginCredentials(req.body);
    if (!credentials) return res.redirect('/login?error=missing');

    try {
      const user = await db.oneOrNone(
        'SELECT user_id, username, email, user_type, password_hash FROM users WHERE username = $1 OR LOWER(email) = LOWER($1)',
        [credentials.identifier]
      );
      if (!user || !(await bcrypt.compare(credentials.password, user.password_hash))) {
        return res.redirect('/login?error=invalid');
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
  return app;
}



module.exports = { createApp };
