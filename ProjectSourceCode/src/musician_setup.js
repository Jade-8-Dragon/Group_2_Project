const message = new URLSearchParams(window.location.search).get('error');
if (message) {
  const box = document.getElementById('error');
  box.textContent = message;   // textContent, so the message can't inject HTML
  box.classList.remove('d-none');
}