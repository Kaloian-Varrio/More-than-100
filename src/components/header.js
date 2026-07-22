const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/#content-areas' },
  { label: 'Featured', href: '/#featured-content' },
  { label: 'Why it matters', href: '/#why-it-matters' },
  { label: 'Dashboard', href: '/dashboard' },
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
          <a class="navbar-brand d-inline-flex align-items-center gap-2 fw-semibold" href="/" aria-label="More Than 100 home">
            <span class="brand-mark" aria-hidden="true">100<span>+</span></span>
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
            <a class="btn btn-light btn-sm ms-lg-3 px-3" href="/#get-started">Get started</a>
          </div>
        </div>
      </nav>
    </header>`;
}
