// Register page: show the server's error message under the field it belongs to,
// then clear it as soon as the user edits that field.
// The server redirects to /register?error=<message>&field=<username|email|password|role>.

const params = new URLSearchParams(window.location.search);
const message = params.get('error');
const field = params.get('field');

// Hide the error for one field: remove the red outline and the message text.
function clearFieldError(name) {
  const error = document.getElementById(name + '-error');
  if (!error) return;
  error.textContent = '';
  error.classList.remove('d-block');
  document.querySelectorAll('[name="' + name + '"]').forEach(input => {
    input.classList.remove('is-invalid');
  });
}

if (message) {
  const fieldError = field && document.getElementById(field + '-error');

  if (fieldError) {
    // textContent (not innerHTML) so text from the URL is never treated as HTML.
    fieldError.textContent = message;
    fieldError.classList.add('d-block');
    const inputs = document.querySelectorAll('[name="' + field + '"]');
    inputs.forEach(input => input.classList.add('is-invalid'));
    if (inputs.length) inputs[0].focus();
  } else {
    const formError = document.getElementById('form-error');
    formError.textContent = message;
    formError.classList.remove('d-none');
  }

  // Remove ?error=... from the address bar so a refresh doesn't show it again.
  window.history.replaceState(null, '', window.location.pathname);
}

// Clear a field's error as soon as the user types in it (or picks a role).
['username', 'email', 'password', 'role'].forEach(name => {
  document.querySelectorAll('[name="' + name + '"]').forEach(input => {
    input.addEventListener('input', () => clearFieldError(name));
    input.addEventListener('change', () => clearFieldError(name));
  });
});
