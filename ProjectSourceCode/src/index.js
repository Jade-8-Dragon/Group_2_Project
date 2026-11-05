require('dotenv').config();
const pgp = require('pg-promise')();
const { createApp } = require('./app');

const db = pgp({
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

db.connect()
  .then(obj => {
    console.log('Database connection successful');
    obj.done();
  })
  .catch(error => console.log('ERROR:', error.message || error));

const app = createApp(db, { sessionSecret: process.env.SESSION_SECRET });

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Website running at http://localhost:${port}`);
});