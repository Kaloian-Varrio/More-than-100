import { createArticleCard } from '../../components/article-card.js';
import { createLoadingState } from '../../components/content-state.js';
import { escapeHtml } from '../../utils/html.js';

const categoryIcons = {
  foods: 'basket2', drinks: 'cup-straw', herbs: 'flower1', mindfulness: 'sun', movement: 'activity', 'emotions-and-senses': 'heart',
};

function createSectionHeading(eyebrow, title, description) {
  return `<div class="section-heading mx-auto text-center"><p class="section-eyebrow mb-2">${eyebrow}</p><h2 class="section-title mb-3">${title}</h2><p class="section-description text-body-secondary mb-0">${description}</p></div>`;
}

function createContentAreaCard(category) {
  const subcategories = category.children.map(({ name }) => escapeHtml(name)).join(' · ');
  return `
    <div class="col-sm-6 col-lg-4">
      <a class="area-card card h-100 border-0" href="/categories/${encodeURIComponent(category.slug)}" aria-label="Explore ${escapeHtml(category.name)} content">
        <div class="card-body p-4 p-xl-5">
          <span class="area-card__icon" aria-hidden="true"><i class="bi bi-${categoryIcons[category.slug] || 'leaf'}"></i></span>
          <h3 class="h4 mt-4 mb-2">${escapeHtml(category.name)}</h3>
          <p class="text-body-secondary mb-3">${escapeHtml(category.description || 'Explore practical ideas for healthier everyday choices.')}</p>
          ${subcategories ? `<p class="area-card__children mb-4">${subcategories}</p>` : ''}
          <span class="area-card__link">Explore ideas <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
        </div>
      </a>
    </div>`;
}

export function createHeroSection() {
  return `
    <section class="home-hero" aria-labelledby="hero-title">
      <div class="container position-relative py-5 py-lg-6">
        <div class="row align-items-center g-5">
          <div class="col-lg-7">
            <p class="hero-kicker mb-3"><i class="bi bi-stars me-2" aria-hidden="true"></i>Healthy living, made practical</p>
            <h1 class="hero-headline mb-4" id="hero-title"><span class="hero-headline__small">Small</span> choices. <span class="hero-headline__smart">Smart</span> actions. A <span class="hero-headline__life">longer, healthier life.</span></h1>
            <p class="hero-copy mb-4">Discover everyday habits for better nutrition, joyful movement, mindful living and stronger social connection—designed to help you invest in a healthier future, one choice at a time.</p>
            <div class="d-flex flex-column flex-sm-row flex-wrap gap-3" aria-label="Get started">
              <a class="btn btn-primary btn-lg px-4" href="/register"><i class="bi bi-person-plus me-2" aria-hidden="true"></i>Register</a>
              <a class="btn btn-outline-primary btn-lg px-4" href="/login"><i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>Login</a>
              <a class="btn btn-link btn-lg hero-assessment-link px-2" href="#assessment">Personal Assessment <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i></a>
            </div>
            <p class="hero-note mt-4 mb-0"><i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>Practical ideas. No pressure. Progress at your pace.</p>
          </div>
          <div class="col-lg-5">
            <div class="hero-visual" aria-label="A balanced approach to everyday wellbeing">
              <div class="hero-orbit hero-orbit--outer"></div><div class="hero-orbit hero-orbit--inner"></div>
              <div class="hero-visual__center"><span class="hero-visual__number">100<span>+</span></span><span class="hero-visual__label">reasons to begin</span></div>
              <div class="hero-pill hero-pill--move"><i class="bi bi-activity"></i><span>Move</span></div>
              <div class="hero-pill hero-pill--nourish"><i class="bi bi-basket2"></i><span>Nourish</span></div>
              <div class="hero-pill hero-pill--connect"><i class="bi bi-people"></i><span>Connect</span></div>
              <div class="hero-pill hero-pill--restore"><i class="bi bi-moon-stars"></i><span>Restore</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

export function createContentAreasSection() {
  return `<section class="content-areas section-space" id="content-areas" aria-labelledby="content-areas-title"><div class="container">${createSectionHeading('Explore your wellbeing', '<span id="content-areas-title">Six areas. One healthier whole.</span>', 'Find approachable ideas across the parts of daily life that help us feel energized, connected and well.')}<div class="row g-4 mt-4" id="category-grid">${createLoadingState('Loading categories...')}</div></div></section>`;
}

export function createFeaturedContentSection() {
  return `<section class="featured-content section-space" id="featured-content" aria-labelledby="featured-title"><div class="container"><div class="d-lg-flex justify-content-between align-items-end gap-4 mb-4 mb-lg-5"><div class="section-heading text-lg-start mb-3 mb-lg-0"><p class="section-eyebrow mb-2">A good place to start</p><h2 class="section-title mb-3" id="featured-title">Practical reads for real life</h2><p class="section-description text-body-secondary mb-0">Short, useful ideas you can carry into your next meal, walk or quiet moment.</p></div><a class="view-all-link" href="#content-areas">Browse all areas <i class="bi bi-arrow-right" aria-hidden="true"></i></a></div><div class="row g-4" id="featured-grid">${createLoadingState('Loading featured articles...')}</div></div></section>`;
}

export function createCategoryGrid(categories) { return categories.map(createContentAreaCard).join(''); }
export function createFeaturedGrid(articles) { return articles.map(createArticleCard).join(''); }

export function createValueSection() {
  const values = [
    ['lightning-charge', 'Small actions', 'Make useful habits feel achievable in an ordinary day.'],
    ['person-walking', 'Active living', 'Find enjoyable ways to move, recover and build consistency.'],
    ['people', 'Stronger connection', 'Make room for relationships, shared time and emotional wellbeing.'],
  ];
  return `
    <section class="value-section section-space" id="why-it-matters" aria-labelledby="value-title"><div class="container"><div class="value-panel"><div class="row align-items-center g-5"><div class="col-lg-5"><p class="section-eyebrow section-eyebrow--light mb-2">Why More Than 100</p><h2 class="section-title text-white mb-3" id="value-title">Healthier years are built in everyday moments.</h2><p class="value-copy mb-0">You do not need to transform everything overnight. Start with one practical habit, learn what works for you and keep moving forward.</p></div><div class="col-lg-7"><div class="row g-3">${values.map(([icon, title, description]) => `<div class="col-md-4"><div class="value-item h-100"><i class="bi bi-${icon}" aria-hidden="true"></i><h3 class="h6 mt-3 mb-2">${title}</h3><p class="mb-0">${description}</p></div></div>`).join('')}</div></div></div></div></div></section>
    <section class="get-started pb-5 pb-lg-6" id="get-started" aria-labelledby="get-started-title"><div class="container"><div class="get-started__panel text-center" id="assessment"><span class="get-started__icon" aria-hidden="true"><i class="bi bi-compass"></i></span><h2 class="h1 mt-4 mb-3" id="get-started-title">Ready for your next small step?</h2><p class="text-body-secondary mx-auto mb-4">Create your account to open your personal dashboard. The lifestyle assessment will be added in the next stage.</p><a class="btn btn-primary btn-lg px-4" href="/register">Create your account</a></div></div></section>`;
}
