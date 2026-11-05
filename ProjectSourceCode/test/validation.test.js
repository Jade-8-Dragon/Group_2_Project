const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRegistration, loginCredentials } = require('../src/validation');

const valid = {
  username: '  testuser  ',
  email: ' TEST@example.com ',
  password: 'Password!1',
  role: 'musician',
};

test('registration validates fields and normalizes username/email', () => {
  const result = validateRegistration(valid);
  assert.deepEqual(result.data, {
    username: 'testuser', email: 'test@example.com', password: 'Password!1', role: 'musician',
  });
});

test('registration rejects missing, weak, or invalid fields', () => {
  for (const change of [
    { username: '' }, { username: 'x'.repeat(51) }, { email: 'invalid' },
    { password: 'password' }, { password: 'Password1' }, { password: 'Pass!word' },
    { role: 'admin' }, { role: '' },
  ]) {
    assert.ok(validateRegistration({ ...valid, ...change }).error, JSON.stringify(change));
  }
  assert.ok(validateRegistration().error);
});

test('login supports either an email or username', () => {
  assert.deepEqual(loginCredentials({ identifier: ' user@example.com ', password: 'secret' }), {
    identifier: 'user@example.com', password: 'secret',
  });
  assert.deepEqual(loginCredentials({ username: ' jade ', password: 'secret' }), {
    identifier: 'jade', password: 'secret',
  });
  assert.equal(loginCredentials({ username: 'jade' }), null);
});
