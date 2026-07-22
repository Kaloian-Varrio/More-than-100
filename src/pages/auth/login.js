import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './auth.css';
import { renderLayout } from '../../components/layout.js';
import { getCurrentUser, loginUser } from '../../services/auth-service.js';
import { initializePasswordToggles, setFormMessage, setSubmitting } from '../../utils/auth-form.js';

if (await getCurrentUser()) {
  window.location.replace('/dashboard');
} else {
  const content = `
    <section class="auth-page d-flex align-items-lg-center py-5">
      <div class="container auth-shell">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <div class="auth-intro mx-auto mx-lg-0">
              <p class="auth-eyebrow mb-3">Welcome back</p>
              <h1 class="auth-title mb-4">Continue your healthier journey.</h1>
              <p class="lead text-body-secondary mb-4">Sign in to reach your dashboard and keep your wellbeing tools in one place.</p>
              <div class="d-grid gap-3">
                <div class="auth-benefit"><i class="bi bi-shield-check" aria-hidden="true"></i><span>Your session is securely managed by Supabase Auth.</span></div>
                <div class="auth-benefit"><i class="bi bi-arrow-repeat" aria-hidden="true"></i><span>Stay signed in across page reloads until you choose to log out.</span></div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="auth-card card border-0">
              <div class="card-body p-4 p-sm-5">
                <h2 class="h3 mb-2">Login</h2>
                <p class="text-body-secondary mb-4">Enter your account details below.</p>
                <div class="d-none" id="form-message" role="alert" aria-live="polite"></div>
                <form id="login-form" novalidate>
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="email">Email</label>
                    <input class="form-control" id="email" name="email" type="email" autocomplete="email" required />
                    <div class="invalid-feedback">Enter a valid email address.</div>
                  </div>
                  <div class="mb-4">
                    <label class="form-label fw-semibold" for="password">Password</label>
                    <div class="input-group">
                      <input class="form-control" id="password" name="password" type="password" autocomplete="current-password" required />
                      <button class="btn password-toggle" type="button" data-password-toggle="#password" aria-label="Show password" aria-pressed="false"><i class="bi bi-eye" aria-hidden="true"></i></button>
                    </div>
                    <div class="invalid-feedback">Enter your password.</div>
                  </div>
                  <button class="btn btn-primary btn-lg w-100" id="submit-button" type="submit" data-default-label="Login">Login</button>
                </form>
                <p class="auth-switch text-center text-body-secondary mt-4 mb-0">New here? <a href="/register">Create an account</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;

  renderLayout({ activePath: '/login', content });
  initializePasswordToggles();

  const form = document.querySelector('#login-form');
  const message = document.querySelector('#form-message');
  const submitButton = document.querySelector('#submit-button');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFormMessage(message);
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    setSubmitting(submitButton, true, 'Logging in…');
    try {
      await loginUser({
        email: form.elements.email.value,
        password: form.elements.password.value,
      });
      setFormMessage(message, 'Login successful. Opening your dashboard…', 'success');
      window.location.assign('/dashboard');
    } catch {
      setFormMessage(message, 'Unable to log in. Check your email and password and try again.');
    } finally {
      setSubmitting(submitButton, false, 'Logging in…');
    }
  });
}
