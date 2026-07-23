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
  const subcategories = category.children.map(({ name }) => escapeHtml(name)).join(' &middot; ');
  return `
    <div class="col-sm-6 col-lg-4">
      <a class="area-card area-card--${escapeHtml(category.slug)} card h-100" href="/categories/${encodeURIComponent(category.slug)}" aria-label="Explore ${escapeHtml(category.name)} content">
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
            <p class="hero-copy mb-3">Understand your stress, sedentary lifestyle and social connection risks&mdash;then receive visual scores, a personalized analysis and relevant articles for your next steps.</p>
            <p class="hero-access-note mb-4" data-assessment-access><i class="bi bi-lock me-2" aria-hidden="true"></i>Login or register to take the assessment and save your results.</p>
            <div class="d-flex flex-column flex-sm-row flex-wrap align-items-sm-center gap-3" aria-label="Get started">
              <a class="btn btn-primary btn-lg px-4" href="/login" data-assessment-cta><i class="bi bi-clipboard2-pulse me-2" aria-hidden="true"></i><span>Take Your Personal Assessment</span></a>
              <a class="btn btn-outline-primary btn-lg px-4" href="/register" data-guest-only><i class="bi bi-person-plus me-2" aria-hidden="true"></i>Register</a>
              <a class="hero-login-link" href="/login" data-guest-only>Already a member? Login</a>
            </div>
            <p class="hero-note mt-4 mb-0"><i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>Practical ideas. No pressure. Progress at your pace.</p>
          </div>
          <div class="col-lg-5">
            <div class="hero-visual" aria-label="A balanced approach to everyday wellbeing">
              <div class="hero-orbit hero-orbit--outer"></div><div class="hero-orbit hero-orbit--inner"></div>
              <div class="hero-visual__center"><span class="hero-visual__number">100<span>+</span></span><span class="hero-visual__label">reasons to begin</span></div>
              ${[['move', 'activity', 'Move'], ['fuel', 'basket2', 'Fuel'], ['connect', 'people', 'Connect'], ['recover', 'moon-stars', 'Recover']].map(([key, icon, label]) => `<div class="hero-orbiting hero-orbiting--${key}"><div class="hero-pill"><i class="bi bi-${icon}" aria-hidden="true"></i><span>${label}</span></div></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

export function createAssessmentPromotionSection() {
  const benefits = [
    ['list-check', '20 focused questions', 'Reflect on stress, movement and social connection in only a few minutes.'],
    ['speedometer2', 'Three visual scores', 'See clear risk levels with responsive gauges and a personalized analysis.'],
    ['journal-heart', 'Five relevant articles', 'Receive practical reading selected from real More Than 100 content.'],
  ];
  return `<section class="assessment-promo section-space" id="assessment" aria-labelledby="assessment-promo-title"><div class="container"><div class="assessment-promo__panel"><div class="row align-items-center g-5"><div class="col-lg-5"><p class="section-eyebrow mb-2">Know where to begin</p><h2 class="section-title mb-3" id="assessment-promo-title">A personal snapshot of your everyday wellbeing.</h2><p class="text-body-secondary mb-4">Complete a short lifestyle self-assessment and turn reflection into realistic next steps. It supports general awareness and is not a medical or psychological diagnosis.</p><a class="btn btn-primary btn-lg" href="/login" data-assessment-cta><i class="bi bi-clipboard2-pulse me-2" aria-hidden="true"></i><span>Take Your Personal Assessment</span></a><p class="small text-body-secondary mt-3 mb-0" data-assessment-access>Login or create an account to begin and save your results.</p></div><div class="col-lg-7"><div class="row g-3">${benefits.map(([icon, title, description], index) => `<div class="col-md-4"><article class="assessment-benefit assessment-benefit--${index + 1} h-100"><span><i class="bi bi-${icon}" aria-hidden="true"></i></span><h3 class="h5 mt-3">${title}</h3><p class="text-body-secondary mb-0">${description}</p></article></div>`).join('')}</div></div></div></div></div></section>`;
}

export function createContentAreasSection() {
  return `<section class="content-areas section-space" id="content-areas" aria-labelledby="content-areas-title"><div class="container">${createSectionHeading('Explore your wellbeing', '<span id="content-areas-title">Six areas. One healthier whole.</span>', 'Find approachable ideas across the parts of daily life that help us feel energized, connected and well.')}<div class="row g-4 mt-4" id="category-grid">${createLoadingState('Loading categories...')}</div></div></section>`;
}

export function createFeaturedContentSection() {
  return `<section class="featured-content section-space" id="featured-content" aria-labelledby="featured-title"><div class="container"><div class="d-lg-flex justify-content-between align-items-end gap-4 mb-4 mb-lg-5"><div class="section-heading text-lg-start mb-3 mb-lg-0"><p class="section-eyebrow mb-2">A good place to start</p><h2 class="section-title mb-3" id="featured-title">Practical reads for real life</h2><p class="section-description text-body-secondary mb-0">Short, useful ideas you can carry into your next meal, walk or quiet moment.</p></div><a class="btn btn-outline-primary" href="/articles">Explore All Articles <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a></div><div class="row g-4" id="featured-grid">${createLoadingState('Loading featured articles...')}</div></div></section>`;
}

export function createStoriesTeaserSection() {
  return `<section class="section-space stories-teaser" aria-labelledby="home-stories-title"><div class="container"><div class="d-lg-flex justify-content-between align-items-end gap-4 mb-4"><div><p class="section-eyebrow mb-2">Healthy living, human stories</p><h2 class="section-title mb-2" id="home-stories-title">See how small choices can fit real life.</h2><p class="text-body-secondary mb-0">Fictional demonstrations shaped around practical routines and everyday challenges.</p></div><a class="btn btn-outline-primary mt-3 mt-lg-0" href="/stories">Explore all stories <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a></div><div class="row g-4" id="home-stories-grid">${createLoadingState('Loading stories...')}</div></div></section>`;
}

export function createCategoryGrid(categories) { return categories.map(createContentAreaCard).join(''); }
export function createFeaturedGrid(articles) { return articles.map(createArticleCard).join(''); }

export function createValueSection() {
  const values = [
    ['person-walking', 'Move more', 'Find enjoyable ways to add movement and build consistency.', 'green'],
    ['basket2', 'Eat better', 'Make nourishing choices that still fit real life and real routines.', 'warm'],
    ['moon-stars', 'Restore well', 'Give sleep, recovery and quiet moments the attention they deserve.', 'teal'],
    ['people', 'Connect deeply', 'Make room for relationships, shared time and belonging.', 'green'],
    ['wind', 'Reduce daily stress', 'Use simple practices to create more calm and perspective.', 'teal'],
    ['repeat', 'Build lasting habits', 'Start small, learn what works and make progress sustainable.', 'warm'],
  ];
  return `
    <section class="value-section section-space" id="why-it-matters" aria-labelledby="value-title"><div class="container"><div class="value-intro row align-items-center g-4 mb-5"><div class="col-lg-8"><p class="section-eyebrow mb-2">Why More Than 100</p><h2 class="section-title mb-3" id="value-title">Healthier years grow from connected everyday choices.</h2><p class="value-copy mb-0">You do not need to transform everything overnight. Begin with one area, notice what helps, and let one useful choice support the next.</p></div><div class="col-lg-4"><div class="value-summary"><strong>6</strong><span>human themes, connected into one practical path</span></div></div></div><div class="value-journey">${values.map(([icon, title, description, accent], index) => `<article class="value-item value-item--${accent}${index % 2 ? ' value-item--reverse' : ''}"><div class="value-item__marker"><span>${String(index + 1).padStart(2, '0')}</span></div><div class="value-item__card"><span class="value-item__icon"><i class="bi bi-${icon}" aria-hidden="true"></i></span><div><h3 class="h4 mb-2">${title}</h3><p class="mb-0">${description}</p></div><i class="bi bi-arrow-down-right value-item__arrow" aria-hidden="true"></i></div></article>`).join('')}</div></div></section>
    <section class="get-started pb-5 pb-lg-6" id="get-started" aria-labelledby="get-started-title"><div class="container"><div class="get-started__panel text-center"><span class="get-started__icon" aria-hidden="true"><i class="bi bi-compass"></i></span><h2 class="h1 mt-4 mb-3" id="get-started-title">Your next small step can start with insight.</h2><p class="text-body-secondary mx-auto mb-4">Take a few minutes to understand your current patterns, then choose one practical action that fits your life.</p><a class="btn btn-outline-primary" href="/login" data-assessment-cta><span>Explore the Personal Assessment</span><i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a></div></div></section>`;
}
