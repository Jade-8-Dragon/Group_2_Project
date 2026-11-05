const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();

require('dotenv').config();

const pgp = require('pg-promise')();
const { createApp } = require('./app');

// *****************************************************
// <!-- Section 2 : Connect to DB (Lowkey Not Done)-->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings (Probably Done)-->
// *****************************************************

// Replaced handelbars with just html
app.use(express.static(path.join(__dirname, 'wireframes')));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here

//auth middleware
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};


const pagesDir = path.join(__dirname, '..', 'pages');

app.get('/', (req, res) => res.redirect('/home'));

app.get('/home', (req, res) => {
    res.sendFile(path.join(pagesDir, 'home.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(pagesDir, 'register_012-2.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(pagesDir, 'login_012-2.html'));
});

app.get('/profile', auth, (req, res) => {
    const file = req.session.user.user_type === 'musician'
        ? 'musicianProfile.html'
        : 'userProfile.html';
    res.sendFile(path.join(pagesDir, file));
});


app.get('/api/profile', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    try {
        const profile = await db.oneOrNone(
            `SELECT u.username, u.email, u.user_type, u.avatar_url,
                    m.stage_name, m.bio, m.location, m.starting_price
             FROM users u
             LEFT JOIN musician_profiles m ON m.user_id = u.user_id
             WHERE u.user_id = $1`,
            [req.session.user.user_id]
        );
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



app.post('/register', async (req, res) => {
    const password = req.body.password;

    // Validate password requirements
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const number = /[0-9]/;

    if (password.length < 8 || !specialChar.test(password) || !number.test(password)) {
        return res.status(400).send('Password must be at least 8 characters long and contain at least one special character and one number.');
    }

    // Hash password using bcrypt
    const hash = await bcrypt.hash(password, 10);

    try {
        await db.none(
            'INSERT INTO users (username, email, password_hash, user_type) VALUES ($1, $2, $3, $4)',
            [req.body.username, req.body.email, hash, req.body.role]
        );

        res.redirect('/login');
    }
    catch (error) {
        console.error(error);
        res.redirect('/register');
    }
});



app.post('/login', async (req, res) => {

    try {
        const user = await db.oneOrNone(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [req.body.username]
        );

        if (!user) {
            return res.status(401).send('Incorrect username/email or password.');
        }

        // Check if password matches stored hash
        const match = await bcrypt.compare(req.body.password, user.password_hash);

        if (!match) {
            return res.status(401).send('Incorrect username/email or password.');
        }

        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            user_type: user.user_type,
        };

        req.session.save((error) => {
            if (error) {
                return res.status(500).send('Session error');
            }
            res.redirect('/profile');
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});




app.get('/logout', auth, (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error);
            return res.status(500).send('Logout failed');
        }
        res.sendFile(path.join(pagesDir, 'logout.html'));
    });
});

module.exports = app;

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Website running at http://localhost:${port}`);
});