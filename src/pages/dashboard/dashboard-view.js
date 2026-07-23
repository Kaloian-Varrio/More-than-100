import { createArticleCard, createArticleImage } from '../../components/article-card.js';
import { createProfileAvatar } from '../../components/profile-avatar.js';
import { getRiskLabel } from '../assessment/assessment-scoring.js';

const dashboardSections = [
  {
    icon: 'bi-person-circle',
    title: 'My Profile',
    description: 'Update your profile details, social links and profile image.',
    href: '/profile',
    action: 'Manage profile',
  },
  {
    icon: 'bi-chat-square-text',
    title: 'My Comments',
    description: 'Review and manage your contributions to community conversations.',
    href: '#my-comments',
    action: 'View comments',
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
    description: 'Review your saved assessment history and personalized summaries.',
    href: '#assessment-history',
    action: 'View results',
  },
  {
    icon: 'bi-lightbulb',
    title: 'Recommendations',
    description: 'Receive practical next steps tailored to your wellbeing journey.',
    href: '#dashboard-recommendations',
    action: 'View recommendations',
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
  const actionMarkup = `<a class="btn btn-outline-primary mt-auto align-self-start" href="${href}">${action}<i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>`;

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

export function createDashboardContent(user, profile, data = {}) {
  const {
    articles = [], comments = [], assessmentResults = [], recommendations = [],
    articlesError = false, commentsError = false, assessmentError = false, recommendationsError = false,
  } = data;
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
        <p class="text-body-secondary mb-0">Jump directly to your content, assessment history and personalized next steps.</p>
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

    <section class="container pb-5 dashboard-section" id="my-comments" aria-labelledby="my-comments-title">
      <div class="mb-4"><p class="text-success fw-semibold mb-2">Your conversations</p><h2 class="h3 mb-0" id="my-comments-title">My Comments</h2></div>
      <div class="dashboard-list-card" id="my-comments-list">${createCommentsMarkup(comments, commentsError)}</div>
      <div class="alert d-none mt-3" id="comments-feedback" role="status" aria-live="polite"></div>
    </section>

    <section class="container pb-5 dashboard-section" id="assessment-history" aria-labelledby="assessment-history-title">
      <div class="d-flex flex-column flex-sm-row align-items-sm-end justify-content-between gap-3 mb-4"><div><p class="text-success fw-semibold mb-2">Your progress</p><h2 class="h3 mb-0" id="assessment-history-title">My Assessment Results</h2></div><a class="btn btn-outline-primary" href="/assessment">Take Assessment</a></div>
      ${createAssessmentHistoryMarkup(assessmentResults, assessmentError)}
    </section>

    <section class="container pb-5 dashboard-section" id="dashboard-recommendations" aria-labelledby="dashboard-recommendations-title">
      <div class="mb-4"><p class="text-success fw-semibold mb-2">Based on your latest result</p><h2 class="h3 mb-0" id="dashboard-recommendations-title">Recommendations</h2></div>
      ${createRecommendationsMarkup(recommendations, assessmentResults, recommendationsError || assessmentError)}
    </section>

    <section class="container pb-5" id="account" aria-labelledby="account-title" tabindex="-1">
      <article class="account-card card border-0 overflow-hidden">
        <div class="row g-0">
          <div class="col-lg-4 account-summary p-4 p-sm-5">
            ${createProfileAvatar(profile, user, 'account-avatar mb-3')}
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
            <a class="btn btn-primary mt-4" href="/profile"><i class="bi bi-pencil-square me-2" aria-hidden="true"></i>Edit Profile</a>
          </div>
        </div>
      </article>
    </section>`;
}

function createCommentsMarkup(comments, hasError) {
  if (hasError) return createDashboardEmpty('exclamation-circle', 'Comments could not be loaded', 'Refresh the page to try again.');
  if (!comments.length) return createDashboardEmpty('chat-square-text', 'No comments yet', 'Comments you add to articles will appear here.');

  return comments.map((comment) => `
    <article class="dashboard-comment p-3 p-lg-4" data-comment-row="${escapeHtml(comment.id)}">
      <div class="d-flex flex-column flex-md-row justify-content-between gap-3">
        <div class="min-w-0">
          <p class="small text-body-secondary mb-2"><i class="bi bi-journal-text me-1" aria-hidden="true"></i>${escapeHtml(comment.article?.title || 'Article unavailable')} &middot; <time datetime="${comment.created_at}">${formatDate(comment.created_at)}</time></p>
          <p class="dashboard-comment__text mb-0">${escapeHtml(comment.content)}</p>
        </div>
        <div class="d-flex flex-wrap align-self-md-start gap-2">
          ${comment.article?.slug ? `<a class="btn btn-sm btn-outline-primary" href="/articles/${encodeURIComponent(comment.article.slug)}">View Article</a>` : ''}
          <button class="btn btn-sm btn-outline-secondary" type="button" data-edit-comment>Edit</button>
          <button class="btn btn-sm btn-outline-danger" type="button" data-delete-comment>Delete</button>
        </div>
      </div>
    </article>`).join('');
}

function createAssessmentHistoryMarkup(results, hasError) {
  if (hasError) return createDashboardEmpty('exclamation-circle', 'Assessment results could not be loaded', 'Refresh the page to try again.');
  if (!results.length) return `${createDashboardEmpty('clipboard2-pulse', 'No assessment results yet', 'Complete your first assessment to see your saved history.')}<div class="text-center mt-3"><a class="btn btn-primary" href="/assessment">Take Your Personal Assessment</a></div>`;

  return `<div class="row g-3">${results.map((result, index) => `<div class="col-12 col-xl-6"><article class="assessment-history-card h-100 p-4"><div class="d-flex justify-content-between align-items-start gap-3 mb-3"><div><p class="small text-body-secondary mb-1"><time datetime="${result.created_at}">${formatDate(result.created_at)}</time></p><h3 class="h5 mb-0">Assessment ${results.length - index}</h3></div>${index === 0 ? '<span class="badge text-bg-success">Latest</span>' : ''}</div><div class="row g-2">${createScore('Stress', result.stress_score)}${createScore('Sedentary lifestyle', result.sedentary_score)}${createScore('Social disconnection', result.social_score)}</div>${result.summary ? `<details class="assessment-summary mt-3"><summary>Read personalized summary</summary><div class="pt-3">${result.summary.split(/\n+/).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></details>` : ''}</article></div>`).join('')}</div>`;
}

function createScore(label, score) {
  const risk = getRiskLabel(score);
  return `<div class="col-sm-4"><div class="dashboard-score dashboard-score--${risk.toLowerCase()}"><span>${escapeHtml(label)}</span><strong>${score}%</strong><small>${risk} risk</small></div></div>`;
}

function createRecommendationsMarkup(recommendations, assessmentResults, hasError) {
  if (hasError) return createDashboardEmpty('exclamation-circle', 'Recommendations could not be loaded', 'Refresh the page to try again.');
  if (!assessmentResults.length) return `${createDashboardEmpty('lightbulb', 'Complete an assessment first', 'Your latest scores help select useful reading for your next steps.')}<div class="text-center mt-3"><a class="btn btn-primary" href="/assessment">Take Your Personal Assessment</a></div>`;
  if (!recommendations.length) return createDashboardEmpty('journal-heart', 'No recommendations available', 'Explore wellbeing categories from the Home page while new content is added.');
  return `<div class="row g-4">${recommendations.map(createArticleCard).join('')}</div>`;
}

function createDashboardEmpty(icon, title, description) {
  return `<div class="article-empty text-center p-5"><i class="bi bi-${icon} d-block mb-3" aria-hidden="true"></i><h3 class="h5">${title}</h3><p class="text-body-secondary mb-0">${description}</p></div>`;
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
