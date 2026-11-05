const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

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
  app.get('/discover', requireLogin, (req, res) => res.sendFile(path.join(pages, 'home.html')));
  app.get('/profile', requireLogin, (req, res) => res.sendFile(path.join(pages, 'userProfile_012-2.html')));

  // Existing account flow, moved into the Express app so it can be tested.
  app.post('/register', async (req, res) => {
    const password = req.body.password || '';
    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).send('Password must be at least 8 characters long and contain one special character and one number.');
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      await db.none('INSERT INTO users (username, email, password_hash, user_type) VALUES ($1, $2, $3, $4)', [
        req.body.username, req.body.email, hash, req.body.role,
      ]);
      return res.redirect('/login');
    } catch (error) {
      console.error('Registration failed:', error.message);
      return res.status(500).send('Registration failed');
    }
  });

  app.post('/login', async (req, res) => {
    try {
      const identifier = req.body.username || req.body.email;
      const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1 OR email = $1', [identifier]);
      if (!user || !(await bcrypt.compare(req.body.password || '', user.password_hash))) {
        return res.status(401).send('Incorrect username/email or password.');
      }
      req.session.user = { user_id: user.user_id, username: user.username, user_type: user.user_type };
      req.session.save(error => {
        if (error) return res.status(500).send('Session error');
        return res.redirect('/discover');
      });
    } catch (error) {
      console.error('Login failed:', error.message);
      return res.status(500).send('Server error');
    }
  });

  app.get('/logout', requireLogin, (req, res) => {
    req.session.destroy(error => {
      if (error) return res.status(500).send('Logout failed');
      res.clearCookie('connect.sid');
      return res.sendFile(path.join(pages, 'logout.html'));
    });
  });

  return app;
}

module.exports = { createApp };
