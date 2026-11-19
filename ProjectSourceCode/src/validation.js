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

function validatePassword(password) {
  if (typeof password !== 'string' ||
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 72 ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      error: 'Password must be at least 8 characters and include at least one number and one special character. Please use a shorter password if necessary.',
      field: 'password'
    };
  }

  return { data: password };
}

function loginCredentials(body = {}) {
  const value = body.identifier || body.username || body.email;
  const identifier = typeof value === 'string' ? value.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!identifier || !password) return null;
  return { identifier, password };
}

function validateMusicianSetup(body = {}) {
  const text = value => (typeof value === 'string' ? value.trim() : '');
  const stageName = text(body.stage_name);
  const bio = text(body.bio);
  const location = text(body.location);
  const priceText = text(body.starting_price);
  const avatarUrl = text(body.avatar_url);

  if (!stageName || stageName.length > 100) return { error: 'Stage name must be 1-100 characters.' };
  if (bio.length > 500) return { error: 'Bio must be 500 characters or less.' };
  if (location.length > 100) return { error: 'Location must be 100 characters or less.' };

  let startingPrice = null;
  if (priceText) {
    startingPrice = Number(priceText);
    if (!Number.isFinite(startingPrice) || startingPrice < 0 || startingPrice > 100000) {
      return { error: 'Starting price must be between 0 and 100000.' };
    }
    startingPrice = Math.round(startingPrice * 100) / 100;
  }

  if (avatarUrl) {
    let parsed = null;
    try { parsed = new URL(avatarUrl); } catch { /* invalid URL */ }
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol) || avatarUrl.length > 500) {
      return { error: 'Profile picture must be a valid http or https link.' };
    }
  }

  return {
    data: {
      stageName,
      bio: bio || null,
      location: location || null,
      startingPrice,
      avatarUrl: avatarUrl || null,
    },
  };
}

module.exports = { validateRegistration, loginCredentials, validatePassword, validateMusicianSetup };
