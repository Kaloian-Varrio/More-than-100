import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import '../../styles/content.css';
import './articles.css';
import { createArticleCard, initializeArticleImages } from '../../components/article-card.js';
import { createEmptyState, createErrorState, createLoadingState } from '../../components/content-state.js';
import { renderLayout } from '../../components/layout.js';
import { getAllArticles } from '../../services/article-service.js';
import { getCategories } from '../../services/category-service.js';
import { escapeHtml } from '../../utils/html.js';

const pageSize = 9;
const state = { articles: [], categories: [], activeSlug: 'all', visibleCount: pageSize };

renderLayout({
  activePath: '/articles',
  mainClass: 'articles-page',
  content: `
    <header class="articles-hero py-5"><div class="container py-lg-4"><p class="articles-eyebrow mb-2">Practical ideas for real life</p><h1 class="display-5 fw-bold mb-3">Explore all articles</h1><p class="lead mb-0">Browse approachable guidance across food, movement, mindfulness, recovery and connection.</p></div></header>
    <section class="container py-5" aria-labelledby="article-library-title">
      <h2 class="visually-hidden" id="article-library-title">Article library</h2>
      <div id="article-filters">${createLoadingState('Loading topics...')}</div>
      <p class="articles-count text-body-secondary mt-4 mb-3" id="articles-count" aria-live="polite"></p>
      <div class="row g-4" id="articles-grid">${createLoadingState('Loading articles...')}</div>
      <div class="text-center mt-5" id="load-more-wrap"></div>
    </section>`,
});

try {
  const [articles, categories] = await Promise.all([getAllArticles(), getCategories()]);
  state.articles = articles;
  state.categories = categories;
  renderFilters();
  renderArticles();
  document.querySelector('#article-filters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button || button.dataset.filter === state.activeSlug) return;
    state.activeSlug = button.dataset.filter;
    state.visibleCount = pageSize;
    renderFilters();
    renderArticles();
  });
} catch (error) {
  console.error('Article library could not be loaded.', error);
  document.querySelector('#article-filters').innerHTML = '';
  document.querySelector('#articles-grid').innerHTML = createErrorState();
}

function renderFilters() {
  const usefulSubcategories = new Set(['sleep', 'breathing', 'outdoor-activities', 'social-connection']);
  const options = [
    { name: 'All', slug: 'all' },
    ...state.categories.filter(({ parent_id: parentId, slug }) => !parentId || usefulSubcategories.has(slug)),
  ];
  document.querySelector('#article-filters').innerHTML = `<div class="article-filters d-flex flex-wrap gap-2" role="group" aria-label="Filter articles by topic">${options.map(({ name, slug }) => `<button class="article-filter${state.activeSlug === slug ? ' active' : ''}" type="button" data-filter="${escapeHtml(slug)}" aria-pressed="${state.activeSlug === slug}">${escapeHtml(name)}</button>`).join('')}</div>`;
}

function filteredArticles() {
  if (state.activeSlug === 'all') return state.articles;
  const selected = state.categories.find(({ slug }) => slug === state.activeSlug);
  if (!selected) return [];
  const categoryIds = new Set([selected.id, ...state.categories.filter(({ parent_id: parentId }) => parentId === selected.id).map(({ id }) => id)]);
  return state.articles.filter(({ category_id: categoryId }) => categoryIds.has(categoryId));
}

function renderArticles() {
  const matching = filteredArticles();
  const visible = matching.slice(0, state.visibleCount);
  const grid = document.querySelector('#articles-grid');
  grid.innerHTML = visible.length ? visible.map(createArticleCard).join('') : createEmptyState('No articles in this topic yet', 'Choose another topic to continue exploring.');
  document.querySelector('#articles-count').textContent = `${matching.length} article${matching.length === 1 ? '' : 's'} found`;
  document.querySelector('#load-more-wrap').innerHTML = state.visibleCount < matching.length
    ? `<button class="btn btn-outline-primary btn-lg" id="load-more" type="button">Load More Articles <span class="badge text-bg-light ms-2">${matching.length - state.visibleCount}</span></button>`
    : '';
  document.querySelector('#load-more')?.addEventListener('click', () => {
    state.visibleCount += pageSize;
    renderArticles();
  });
  initializeArticleImages(grid);
}
