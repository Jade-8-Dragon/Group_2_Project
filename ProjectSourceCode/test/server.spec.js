const chai = require('chai');
const chaiHttp = require('chai-http');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('node:crypto');
const { createApp } = require('../src/app');
const { validateRegistration } = require('../src/validation');

if (process.env.NODE_ENV !== 'test' || process.env.POSTGRES_HOST !== 'db-test') {
  throw new Error('Run Lab 10 tests using docker-compose.test.yaml only');
}

const { db, pgp } = require('../src/db');
chai.use(chaiHttp);
const { expect } = chai;
const app = createApp(db, { sessionSecret: process.env.SESSION_SECRET });

after(() => pgp.end());

describe('GET /welcome', () => {
  it('returns the expected welcome JSON', async () => {
    const res = await chai.request(app).get('/welcome');
    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal({ status: 'success', message: 'Welcome!' });
  });
});

describe('Registration validation (unit test)', () => {
  it('rejects a missing password without HTTP or a database', () => {
    const result = validateRegistration({
      username: 'lab10student', email: 'student@example.com', role: 'customer',
    });
    expect(result.error).to.be.a('string');
  });
});

describe('POST /register (integration tests)', () => {
  const username = `lab10_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const validUser = {
    username,
    email: `${username}@example.com`,
    password: 'TestPassword123!',
    role: 'customer',
  };

  async function removeTestUser() {
    await db.none('DELETE FROM users WHERE username = $1', [username]);
  }

  beforeEach(removeTestUser);
  afterEach(removeTestUser);

  it('registers one user and saves a bcrypt password hash', async () => {
    const res = await chai.request(app)
      .post('/register')
      .redirects(0)
      .type('form')
      .send(validUser);

    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal('/login');

    const rows = await db.any(
      'SELECT username, email, user_type, password_hash FROM users WHERE username = $1',
      [username]
    );
    expect(rows).to.have.lengthOf(1);
    expect(rows[0].email).to.equal(validUser.email);
    expect(rows[0].user_type).to.equal(validUser.role);
    expect(rows[0].password_hash).not.to.equal(validUser.password);
    expect(await bcrypt.compare(validUser.password, rows[0].password_hash)).to.equal(true);
  });


  it('rejects a missing password without creating a user', async () => {
    const { password, ...invalidUser } = validUser;

    const res = await chai.request(app)
      .post('/register')
      .redirects(0)
      .type('form')
      .send(invalidUser);

    expect(res).to.have.status(302);
    expect(res.headers.location).to.match(/^\/register\?error=/);

    const rows = await db.any(
      'SELECT user_id FROM users WHERE username = $1',
      [username]
    );

    expect(rows).to.have.lengthOf(0);
  });
});

describe('GET /api/profile (extra credit integration tests)', () => {
  const username = `lab10_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const email = `${username}@example.com`;
  const password = 'TestPassword123!';
  let agent;

  async function removeTestUser() {
    await db.none('DELETE FROM users WHERE username = $1', [username]);
  }

  beforeEach(async () => {
    await removeTestUser();
    const hash = await bcrypt.hash(password, 10);
    await db.none(
      'INSERT INTO users (username, email, password_hash, user_type) VALUES ($1, $2, $3, $4)',
      [username, email, hash, 'customer']
    );
    agent = chai.request.agent(app);
  });

  afterEach(async () => {
    agent.close();
    await removeTestUser();
  });

  it('returns the logged-in user\'s profile after POST /login', async () => {
    const login = await agent
      .post('/login')
      .redirects(0)
      .type('form')
      .send({ username, password });
    expect(login).to.have.status(302);
    expect(login.headers.location).to.equal('/discover');

    const res = await agent.get('/api/profile');
    expect(res).to.have.status(200);
    expect(res).to.be.json;
    expect(res.body.username).to.equal(username);
    expect(res.body.email).to.equal(email);
    expect(res.body.user_type).to.equal('customer');
    expect(res.body).not.to.have.property('password_hash');
  });

  it('rejects a request without a session', async () => {
    const res = await chai.request(app).get('/api/profile');
    expect(res).to.have.status(401);
    expect(res.body).to.deep.equal({ error: 'Please log in.' });
  });
});
