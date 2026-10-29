// *****************************************************
// <!-- Section 1 : Import Dependencies (Done)-->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

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
app.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname, 'wireframes', 'register.html'));
});

app.post('/register', async (req, res) => {
    const hash = await bcrypt.hash(req.body.password, 10);

    //TODO - Add Email Section and Role Section
    try{
        await db.none('INSERT INTO users (username, password) VALUES ($1, $2)', 
        [req.body.username, hash])

        res.redirect('/login');
    }
    catch{
        res.redirect('/register');
    }
    
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'wireframes', 'login.html'));
});

app.post('/login', async (req,res) => {

    //TODO - Add Email Section
    try{
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1',
        [req.body.username]);

        if(!user)
        {
            return res.redirect('/register');
        }

        // check if password from request matches with password in DB
        const match = await bcrypt.compare(req.body.password, user.password);

        if (!match)
        {
            return res.status(401).send('Incorrect username or password.');
        }
        
        req.session.user = user;

        req.session.save((error) => {
            if(error)
            {
                return res.status(500).send('Session error');
            }
            res.redirect('/discover');
        });
    }
    catch (error)
    {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/logout', auth, (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error);
            return res.status(500).send('Logout failed');
        }

        res.render('pages/logout', {
            message: 'Logged out Successfully'
        });
    });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');