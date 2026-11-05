const chai = require('chai');
const chaiHttp = require('chai-http');
const { createApp } = require('../src/app');

chai.use(chaiHttp);

const { expect } = chai;

const app = createApp({}, {
  sessionSecret: 'lab10-test-secret'
});

describe('GET /welcome', () => {
  it('should return a successful welcome message', async () => {
    const res = await chai.request(app).get('/welcome');

    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.message).to.equal('Welcome!');
  });
});

const { validateRegistration } = require('../src/validation');

describe('Registration Validation', () => {
  it('should reject registration with an empty password', () => {
    const user = {
      username: 'testuser',
      email: 'test@example.com',
      password: '',
      role: 'musician'
    };

    const result = validateRegistration(user);

    expect(result.error).to.exist;
  });
});