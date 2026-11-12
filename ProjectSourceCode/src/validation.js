// Keep request validation separate from Express so it is easy to test.
function validateRegistration(body = {}) {
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = body.role;

  if (!username || username.length > 50) return { error: 'Username must be 1-50 characters.', field: 'username' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return { error: 'Enter a valid email address.', field: 'email' };
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72 ||
      !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { error: 'Password must be at least 8 characters and include at least one number and one special character. Please use a shorter password if necessary.', field: 'password' };
  }
  if (!['customer', 'musician'].includes(role)) {
    return { error: 'Choose a customer or musician account.', field: 'role' };
  }

  return { data: { username, email, password, role } };
}

function loginCredentials(body = {}) {
  const value = body.identifier || body.username || body.email;
  const identifier = typeof value === 'string' ? value.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!identifier || !password) return null;
  return { identifier, password };
}

module.exports = { validateRegistration, loginCredentials };
