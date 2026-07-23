import { getCurrentUser, logoutUser, onAuthStateChange } from '../services/auth-service.js';
import { isCurrentUserAdmin } from '../services/role-service.js';

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles' },
  { label: 'Explore Topics', href: '/#content-areas' },
  { label: 'Why it matters', href: '/#why-it-matters' },
];

export function createHeader(activePath) {
  const navigation = navigationItems
    .map(({ label, href }) => {
      const isActive = activePath === href;
      return `
        <li class="nav-item">
          <a class="nav-link${isActive ? ' active' : ''}" href="${href}"${isActive ? ' aria-current="page"' : ''}>
            ${label}
          </a>
        </li>`;
    })
    .join('');

  return `
    <header>
      <nav class="navbar navbar-expand-lg navbar-dark site-navbar" aria-label="Main navigation">
        <div class="container">
          <a class="navbar-brand d-inline-flex align-items-center gap-2 fw-semibold" href="/" aria-label="More Than 100 home" data-brand-identity>
            <span class="brand-mark" aria-hidden="true" data-brand-fallback>100<span>+</span></span>
            <img class="brand-logo brand-logo--header" alt="" data-brand-logo hidden>
            <span>More Than 100</span>
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavigation"
            aria-controls="mainNavigation"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNavigation">
            <ul class="navbar-nav ms-auto mb-3 mb-lg-0 align-items-lg-center">
              ${navigation}
            </ul>
            <div class="auth-navigation ms-lg-3" id="auth-navigation" aria-live="polite">
              <span class="spinner-border spinner-border-sm text-light" aria-label="Loading account navigation"></span>
            </div>
          </div>
        </div>
      </nav>
    </header>`;
}

function renderAuthNavigation(user, activePath = window.location.pathname, isAdmin = false) {
  const container = document.querySelector('#auth-navigation');
  if (!container) return;

  if (!user) {
    container.innerHTML = `
      <div class="d-flex flex-column flex-lg-row gap-2">
        <a class="btn btn-outline-light btn-sm px-3" href="/login">Login</a>
        <a class="btn btn-light btn-sm px-3" href="/register">Register</a>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="d-flex flex-column flex-lg-row align-items-lg-center gap-2">
      <a class="nav-link text-white${activePath === '/dashboard' ? ' active' : ''}" href="/dashboard"${activePath === '/dashboard' ? ' aria-current="page"' : ''}>Dashboard</a>
      <a class="nav-link text-white${activePath === '/profile' ? ' active' : ''}" href="/profile"${activePath === '/profile' ? ' aria-current="page"' : ''}><i class="bi bi-person-circle me-1" aria-hidden="true"></i>Profile</a>
      ${isAdmin ? `<a class="nav-link text-white${activePath === '/admin' ? ' active' : ''}" href="/admin"${activePath === '/admin' ? ' aria-current="page"' : ''}><i class="bi bi-shield-lock me-1" aria-hidden="true"></i>Admin</a>` : ''}
      <button class="btn btn-outline-light btn-sm px-3" id="logout-button" type="button"><i class="bi bi-box-arrow-right me-1" aria-hidden="true"></i>Logout</button>
    </div>`;

  document.querySelector('#logout-button').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Logging out...';
    try {
      await logoutUser();
      window.location.assign('/');
    } catch {
      button.disabled = false;
      button.innerHTML = '<i class="bi bi-box-arrow-right me-1" aria-hidden="true"></i>Logout';
    }
  });
}

export async function initializeAuthHeader(activePath) {
  const render = async (user) => renderAuthNavigation(user, activePath, user ? await isCurrentUserAdmin().catch(() => false) : false);
  onAuthStateChange((user) => { render(user); });
  await render(await getCurrentUser());
}
