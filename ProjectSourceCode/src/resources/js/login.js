// Login page: turn the server's ?error=<code> into a message above the Login button,
// then clear it as soon as the user edits either field.
// For "invalid" we never say which field was wrong, so we don't reveal which usernames exist.

const LOGIN_ERRORS = {
  missing: 'Enter your username or email and your password.',
  invalid: 'Incorrect username or password.',
  server: 'Something went wrong. Please try again.',
};

const code = new URLSearchParams(window.location.search).get('error');
const loginError = document.getElementById('login-error');

function clearLoginError() {
  loginError.textContent = '';
  loginError.classList.add('d-none');
}

if (code) {
  // Unknown codes get the generic message rather than showing text from the URL.
  loginError.textContent = LOGIN_ERRORS[code] || LOGIN_ERRORS.server;
  loginError.classList.remove('d-none');
  document.getElementById('username').focus();

  // Remove ?error=... from the address bar so a refresh doesn't show it again.
  window.history.replaceState(null, '', window.location.pathname);
}

['username', 'password'].forEach(id => {
  document.getElementById(id).addEventListener('input', clearLoginError);
});
