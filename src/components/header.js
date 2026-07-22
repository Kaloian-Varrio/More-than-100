const navigationItems = [
  { label: 'Home', href: '/' },
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
      <nav class="navbar navbar-expand-md navbar-dark bg-success" aria-label="Main navigation">
        <div class="container">
          <a class="navbar-brand fw-semibold" href="/">More Than 100</a>
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
            <ul class="navbar-nav ms-auto mb-2 mb-md-0">
              ${navigation}
            </ul>
          </div>
        </div>
      </nav>
    </header>`;
}
