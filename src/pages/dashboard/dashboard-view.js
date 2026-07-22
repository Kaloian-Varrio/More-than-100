import { createArticleImage } from '../../components/article-card.js';

const dashboardSections = [
  {
    icon: 'bi-person-circle',
    title: 'My Profile',
    description: 'View your account details and prepare for future profile customization.',
    href: '#account',
    action: 'View account',
  },
  {
    icon: 'bi-chat-square-text',
    title: 'My Comments',
    description: 'Review and manage your contributions to community conversations.',
  },
  {
    icon: 'bi-clipboard2-pulse',
    title: 'Personal Assessment',
    description: 'Explore your daily habits across movement, stress and social wellbeing.',
    href: '/assessment',
    action: 'Start assessment',
  },
  {
    icon: 'bi-graph-up-arrow',
    title: 'My Assessment Results',
    description: 'Your saved assessment history and wellbeing trends will appear here.',
  },
  {
    icon: 'bi-lightbulb',
    title: 'Recommendations',
    description: 'Receive practical next steps tailored to your wellbeing journey.',
  },
];

function escapeHtml(value = '') {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

function getDisplayName(user, profile) {
  return profile?.nickname?.trim()
    || profile?.first_name?.trim()
    || user.email
    || 'there';
}

function createSectionCard({ icon, title, description, href, action }) {
  const actionMarkup = href
    ? `<a class="btn btn-outline-primary mt-auto align-self-start" href="${href}">${action}<i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>`
    : '<span class="dashboard-status mt-auto align-self-start"><i class="bi bi-clock me-1" aria-hidden="true"></i>Coming soon</span>';

  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="card dashboard-card h-100 border-0">
        <div class="card-body d-flex flex-column p-4">
          <span class="dashboard-icon mb-4" aria-hidden="true"><i class="bi ${icon}"></i></span>
          <h2 class="h5 card-title">${title}</h2>
          <p class="card-text text-body-secondary mb-4">${description}</p>
          ${actionMarkup}
        </div>
      </article>
    </div>`;
}

export function createDashboardContent(user, profile, articles = [], articlesError = false) {
  const displayName = escapeHtml(getDisplayName(user, profile));
  const firstName = escapeHtml(profile?.first_name || 'Not provided');
  const lastName = escapeHtml(profile?.last_name || 'Not provided');
  const nickname = escapeHtml(profile?.nickname || 'Not provided');
  const email = escapeHtml(user.email || 'Not available');

  return `
    <section class="dashboard-hero py-5">
      <div class="container py-lg-4">
        <div class="row align-items-center g-4">
          <div class="col-lg-8">
            <p class="dashboard-eyebrow mb-2">Your wellbeing dashboard</p>
            <h1 class="display-6 fw-bold mb-3">Welcome, ${displayName}.</h1>
            <p class="lead mb-0">Your space for practical habits, personal progress and a longer, healthier life.</p>
          </div>
          <div class="col-lg-4 text-lg-end">
            <a class="btn btn-light btn-lg" href="#dashboard-tools"><i class="bi bi-grid me-2" aria-hidden="true"></i>Explore your tools</a>
          </div>
        </div>
      </div>
    </section>

    <section class="container py-5" id="dashboard-tools" aria-labelledby="dashboard-tools-title">
      <div class="mb-4">
        <p class="text-success fw-semibold mb-2">Small steps, organized</p>
        <h2 class="h3 mb-2" id="dashboard-tools-title">Your dashboard</h2>
        <p class="text-body-secondary mb-0">These areas will grow as personal features become available.</p>
      </div>
      <div class="row g-4">
        ${dashboardSections.map(createSectionCard).join('')}
      </div>
    </section>

    <section class="container pb-5" id="my-articles" aria-labelledby="my-articles-title">
      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div><p class="text-success fw-semibold mb-2">Your contributions</p><h2 class="h3 mb-0" id="my-articles-title">My Articles</h2></div>
        <a class="btn btn-primary" href="/articles/create"><i class="bi bi-plus-lg me-2" aria-hidden="true"></i>Create Article</a>
      </div>
      <div class="my-articles-card" id="my-articles-list">
        ${createArticlesMarkup(articles, articlesError)}
      </div>
    </section>

    <section class="container pb-5" id="account" aria-labelledby="account-title" tabindex="-1">
      <article class="account-card card border-0 overflow-hidden">
        <div class="row g-0">
          <div class="col-lg-4 account-summary p-4 p-sm-5">
            <span class="account-avatar mb-3" aria-hidden="true"><i class="bi bi-person"></i></span>
            <p class="text-uppercase fw-semibold small mb-2">My Profile</p>
            <h2 class="h3 mb-2" id="account-title">Account details</h2>
            <p class="mb-0">Basic information connected to your secure account.</p>
          </div>
          <div class="col-lg-8 bg-white p-4 p-sm-5">
            <dl class="row account-details mb-0">
              <dt class="col-sm-4">Nickname</dt><dd class="col-sm-8">${nickname}</dd>
              <dt class="col-sm-4">First name</dt><dd class="col-sm-8">${firstName}</dd>
              <dt class="col-sm-4">Last name</dt><dd class="col-sm-8">${lastName}</dd>
              <dt class="col-sm-4">Email</dt><dd class="col-sm-8 mb-0 text-break">${email}</dd>
            </dl>
            <p class="small text-body-secondary mt-4 mb-0"><i class="bi bi-shield-lock me-1" aria-hidden="true"></i>Profile editing and image uploads will be available in a future update.</p>
          </div>
        </div>
      </article>
    </section>`;
}

function createArticlesMarkup(articles, hasError) {
  if (hasError) return '<div class="article-empty text-center p-5"><i class="bi bi-exclamation-circle d-block mb-3" aria-hidden="true"></i><h3 class="h5">Articles could not be loaded</h3><p class="text-body-secondary mb-0">Refresh the page to try again.</p></div>';
  if (!articles.length) return '<div class="article-empty text-center p-5"><i class="bi bi-journal-plus d-block mb-3" aria-hidden="true"></i><h3 class="h5">No articles yet</h3><p class="text-body-secondary mb-3">Create your first article and share it with the community.</p><a class="btn btn-primary" href="/articles/create">Create Article</a></div>';

  return articles.map((article) => `
    <article class="dashboard-article d-flex flex-column flex-md-row gap-3 p-3 p-lg-4" data-article-row>
      <div class="dashboard-article__image">${createDashboardImage(article)}</div>
      <div class="flex-grow-1 min-w-0">
        <p class="article-card__category mb-1">${escapeHtml(article.category?.name || 'Wellbeing')}</p>
        <h3 class="h5 mb-2 text-break">${escapeHtml(article.title)}</h3>
        <p class="small text-body-secondary mb-3"><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${formatDate(article.created_at)}</p>
        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-sm btn-outline-primary" href="/articles/${encodeURIComponent(article.slug)}">View</a>
          <a class="btn btn-sm btn-outline-secondary" href="/articles/${encodeURIComponent(article.slug)}/edit">Edit</a>
          <button class="btn btn-sm btn-outline-danger" type="button" data-delete-article="${escapeHtml(article.id)}">Delete</button>
        </div>
      </div>
    </article>`).join('');
}

function createDashboardImage(article) {
  return createArticleImage(article, { className: 'dashboard-article__cover' });
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}
