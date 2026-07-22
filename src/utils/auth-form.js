const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export function validatePassword(password) {
  return passwordPattern.test(password);
}

export function setFormMessage(element, message = '', type = 'danger') {
  element.className = message ? `alert alert-${type}` : 'd-none';
  element.textContent = message;
}

export function setSubmitting(button, isSubmitting, loadingLabel) {
  button.disabled = isSubmitting;
  button.innerHTML = isSubmitting
    ? `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${loadingLabel}`
    : button.dataset.defaultLabel;
}

export function initializePasswordToggles(container = document) {
  container.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.querySelector(button.dataset.passwordToggle);
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      button.setAttribute('aria-pressed', String(reveal));
      button.querySelector('.bi').className = `bi bi-eye${reveal ? '-slash' : ''}`;
    });
  });
}
