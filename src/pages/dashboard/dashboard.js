import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './dashboard.css';
import { renderLayout } from '../../components/layout.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';

const user = await requireAuthenticatedUser();

if (user) {
  const dashboardContent = `
    <section class="container py-5">
      <div class="mb-4">
        <p class="text-success fw-semibold mb-2">Dashboard</p>
        <h1 class="h2 mb-2">Welcome to your wellbeing space</h1>
        <p class="text-body-secondary mb-0">This is the initial dashboard structure. Personal features will be added later.</p>
      </div>

      <div class="row g-4">
        <div class="col-12 col-md-6">
          <article class="card dashboard-card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="h5 card-title">Your activity</h2>
              <p class="card-text text-body-secondary mb-0">Future assessments and activity summaries will appear here.</p>
            </div>
          </article>
        </div>
        <div class="col-12 col-md-6">
          <article class="card dashboard-card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="h5 card-title">Recommended reading</h2>
              <p class="card-text text-body-secondary mb-0">Personalized healthy-living content will appear here.</p>
            </div>
          </article>
        </div>
        <div class="col-12" id="account">
          <article class="card dashboard-card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="h5 card-title"><i class="bi bi-person-circle me-2 text-success" aria-hidden="true"></i>Your account</h2>
              <p class="card-text text-body-secondary mb-0">Signed in as <strong>${user.email}</strong>. Full profile management will be added later.</p>
            </div>
          </article>
        </div>
      </div>
    </section>`;

  renderLayout({ activePath: '/dashboard', content: dashboardContent });
}
