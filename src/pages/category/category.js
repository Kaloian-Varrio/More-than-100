import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import '../../styles/content.css';
import { createArticleCard, initializeArticleImages } from '../../components/article-card.js';
import { createEmptyState, createErrorState, createLoadingState } from '../../components/content-state.js';
import { renderLayout } from '../../components/layout.js';
import { getArticlesByCategoryIds } from '../../services/article-service.js';
import { getCategoryBySlug } from '../../services/category-service.js';
import { escapeHtml } from '../../utils/html.js';

const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).at(-1) || '');
renderLayout({ activePath: '/categories', content: `<section id="category-content">${createLoadingState('Loading category...')}</section>`, mainClass: 'content-page' });

const container = document.querySelector('#category-content');

try {
  const category = await getCategoryBySlug(slug);
  if (!category) {
    container.className = 'container py-5';
    container.innerHTML = createEmptyState('Category not found', 'Choose another wellbeing area from the home page.');
  } else {
    const categoryIds = [category.id, ...category.children.map(({ id }) => id)];
    const articles = await getArticlesByCategoryIds(categoryIds);
    document.title = `${category.name} | More Than 100`;
    const parentLink = category.parent ? `<a href="/categories/${encodeURIComponent(category.parent.slug)}">${escapeHtml(category.parent.name)}</a><span aria-hidden="true"> / </span>` : '';
    const subcategories = category.children.length
      ? `<div class="subcategory-list d-flex flex-wrap gap-2 mt-4" aria-label="Subcategories">${category.children.map((child) => `<a href="/categories/${encodeURIComponent(child.slug)}">${escapeHtml(child.name)}</a>`).join('')}</div>`
      : '';
    container.innerHTML = `
      <header class="content-page-hero py-5"><div class="container py-lg-4"><p class="text-success fw-semibold mb-2">${parentLink}Category</p><h1 class="display-5 fw-bold mb-3">${escapeHtml(category.name)}</h1><p class="lead text-body-secondary mb-0">${escapeHtml(category.description || 'Practical ideas for everyday health and wellbeing.')}</p>${subcategories}</div></header>
      <section class="container py-5" aria-labelledby="category-articles-title"><h2 class="h3 mb-4" id="category-articles-title">Articles</h2>${articles.length ? `<div class="row g-4">${articles.map(createArticleCard).join('')}</div>` : createEmptyState('No articles here yet', 'New practical ideas will be added to this category soon.')}</section>`;
    initializeArticleImages(container);
  }
} catch (error) {
  console.error('Category could not be loaded.', error);
  container.className = 'container py-5';
  container.innerHTML = createErrorState();
}
