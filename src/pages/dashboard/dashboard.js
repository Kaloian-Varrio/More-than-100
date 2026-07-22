import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './dashboard.css';
import { renderLayout } from '../../components/layout.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';
import { getProfile } from '../../services/profile-service.js';
import { createDashboardContent } from './dashboard-view.js';

document.querySelector('#app').innerHTML = `
  <main class="dashboard-loading d-grid min-vh-100" aria-live="polite">
    <div class="text-center">
      <span class="spinner-border text-success mb-3" aria-hidden="true"></span>
      <p class="fw-semibold mb-0">Loading your dashboard...</p>
    </div>
  </main>`;

const user = await requireAuthenticatedUser();

if (user) {
  let profile = null;
  try {
    profile = await getProfile(user.id);
  } catch (error) {
    console.warn('Profile details could not be loaded.', error);
  }

  renderLayout({ activePath: '/dashboard', content: createDashboardContent(user, profile) });

  if (window.location.hash === '#account') {
    requestAnimationFrame(() => {
      const accountSection = document.querySelector('#account');
      accountSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      accountSection?.focus({ preventScroll: true });
    });
  }
}
