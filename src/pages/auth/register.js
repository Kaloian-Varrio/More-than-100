import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './auth.css';
import { renderLayout } from '../../components/layout.js';
import { getCurrentUser, registerUser } from '../../services/auth-service.js';
import {
  initializePasswordToggles,
  setFormMessage,
  setSubmitting,
  validatePassword,
} from '../../utils/auth-form.js';

if (await getCurrentUser()) {
  window.location.replace('/dashboard');
} else {
  const content = `
    <section class="auth-page d-flex align-items-lg-center py-5">
      <div class="container auth-shell">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <div class="auth-intro mx-auto mx-lg-0">
              <p class="auth-eyebrow mb-3">Start with one small step</p>
              <h1 class="auth-title mb-4">Create your wellbeing space.</h1>
              <p class="lead text-body-secondary mb-4">Join More Than 100 to access your dashboard and future personal assessment tools.</p>
              <div class="d-grid gap-3">
                <div class="auth-benefit"><i class="bi bi-person-check" aria-hidden="true"></i><span>Every new account receives a private profile and standard user access.</span></div>
                <div class="auth-benefit"><i class="bi bi-lock" aria-hidden="true"></i><span>Admin access can never be selected during registration.</span></div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="auth-card card border-0">
              <div class="card-body p-4 p-sm-5">
                <h2 class="h3 mb-2">Register</h2>
                <p class="text-body-secondary mb-4">Use an email address you can access.</p>
                <div class="d-none" id="form-message" role="alert" aria-live="polite"></div>
                <form id="register-form" novalidate>
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="email">Email</label>
                    <input class="form-control" id="email" name="email" type="email" autocomplete="email" required />
                    <div class="invalid-feedback">Enter a valid email address.</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="password">Password</label>
                    <div class="input-group">
                      <input class="form-control" id="password" name="password" type="password" autocomplete="new-password" minlength="6" required />
                      <button class="btn password-toggle" type="button" data-password-toggle="#password" aria-label="Show password" aria-pressed="false"><i class="bi bi-eye" aria-hidden="true"></i></button>
                    </div>
                    <p class="password-rules mt-2 mb-0">Use 6+ characters with uppercase, lowercase, a number and a special character.</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="confirm-password">Confirm password</label>
                    <div class="input-group">
                      <input class="form-control" id="confirm-password" name="confirmPassword" type="password" autocomplete="new-password" required />
                      <button class="btn password-toggle" type="button" data-password-toggle="#confirm-password" aria-label="Show password confirmation" aria-pressed="false"><i class="bi bi-eye" aria-hidden="true"></i></button>
                    </div>
                  </div>
                  <div class="form-check mb-4">
                    <input class="form-check-input" id="age-confirmation" name="ageConfirmation" type="checkbox" required />
                    <label class="form-check-label" for="age-confirmation">I confirm that I am at least 16 years old.</label>
                    <div class="invalid-feedback">You must be at least 16 years old to register.</div>
                  </div>
                  <button class="btn btn-primary btn-lg w-100" id="submit-button" type="submit" data-default-label="Create account">Create account</button>
                </form>
                <p class="auth-switch text-center text-body-secondary mt-4 mb-0">Already registered? <a href="/login">Login</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;

  renderLayout({ activePath: '/register', content });
  initializePasswordToggles();

  const form = document.querySelector('#register-form');
  const message = document.querySelector('#form-message');
  const submitButton = document.querySelector('#submit-button');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFormMessage(message);
    form.classList.add('was-validated');

    const password = form.elements.password.value;
    const confirmation = form.elements.confirmPassword.value;
    if (!form.checkValidity()) {
      setFormMessage(message, 'Complete all required fields before continuing.');
      return;
    }
    if (!validatePassword(password)) {
      setFormMessage(message, 'Password must contain uppercase, lowercase, a number and a special character.');
      return;
    }
    if (password !== confirmation) {
      setFormMessage(message, 'Password and confirmation do not match.');
      return;
    }

    setSubmitting(submitButton, true, 'Creating account…');
    try {
      const { session } = await registerUser({
        email: form.elements.email.value,
        password,
      });
      if (session) {
        setFormMessage(message, 'Account created. Opening your dashboard…', 'success');
        window.location.assign('/dashboard');
      } else {
        setFormMessage(message, 'Account created. Confirm your email before logging in.', 'success');
        form.reset();
        form.classList.remove('was-validated');
      }
    } catch (error) {
      const duplicateMessage = error.message.includes('already exists')
        ? error.message
        : 'Unable to create the account. Review your details and try again.';
      setFormMessage(message, duplicateMessage);
    } finally {
      setSubmitting(submitButton, false, 'Creating account…');
    }
  });
}
