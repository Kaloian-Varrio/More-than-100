import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import '../../styles/content.css';
import './comments.css';
import { createEmptyState, createErrorState, createLoadingState } from '../../components/content-state.js';
import { initializeArticleImages } from '../../components/article-card.js';
import { renderLayout } from '../../components/layout.js';
import { getArticleBySlug } from '../../services/article-service.js';
import { escapeHtml, safeImageUrl } from '../../utils/html.js';
import { initializeComments } from './comments.js';

const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).at(-1) || '');
renderLayout({ activePath: '/articles', content: `<section class="container py-5" id="article-content">${createLoadingState('Loading article...')}</section>`, mainClass: 'content-page' });

const container = document.querySelector('#article-content');

try {
  const article = await getArticleBySlug(slug);
  if (!article) {
    container.innerHTML = createEmptyState('Article not found', 'This article may have moved or is no longer available.');
  } else {
    const title = escapeHtml(article.title);
    const imageUrl = safeImageUrl(article.cover_image_url);
    const authorName = article.author?.nickname
      || [article.author?.first_name, article.author?.last_name].filter(Boolean).join(' ')
      || 'More Than 100 contributor';
    const paragraphs = article.content.split(/\n+/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
    document.title = `${article.title} | More Than 100`;
    container.innerHTML = `
      <article class="py-lg-4">
        <nav aria-label="Breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="/">Home</a></li><li class="breadcrumb-item"><a href="/categories/${encodeURIComponent(article.category.slug)}">${escapeHtml(article.category.name)}</a></li><li class="breadcrumb-item active" aria-current="page">Article</li></ol></nav>
        <header class="mx-auto article-body mb-5">
          <p class="article-card__category mb-2">${escapeHtml(article.category.name)}</p>
          <h1 class="display-5 fw-bold mb-3">${title}</h1>
          ${article.short_description ? `<p class="lead text-body-secondary">${escapeHtml(article.short_description)}</p>` : ''}
          <p class="small text-body-secondary mb-0">By ${escapeHtml(authorName)} <span aria-hidden="true">·</span> ${new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(article.created_at))}</p>
        </header>
        ${imageUrl ? `<div class="article-cover-wrap mx-auto mb-5"><img class="article-cover d-block" data-content-image src="${escapeHtml(imageUrl)}" alt="Cover for ${title}" width="1600" height="900" /><div class="article-card__fallback article-cover-fallback" data-image-fallback hidden><i class="bi bi-image" aria-hidden="true"></i><span>Image unavailable</span></div></div>` : ''}
        <div class="article-body mx-auto">${paragraphs}</div>
      </article>
      <section class="comments-shell mx-auto py-5 border-top" id="comments-section" aria-labelledby="comments-title">
        <h2 class="h3 mb-4" id="comments-title"><i class="bi bi-chat-square-text me-2 text-success" aria-hidden="true"></i>Comments</h2>
        <div class="d-none" id="comment-feedback" role="status" aria-live="polite"></div>
        <div class="mb-4" id="comment-composer"></div>
        <div id="comment-list">${createLoadingState('Loading comments...')}</div>
      </section>`;
    initializeArticleImages(container);
    await initializeComments(article.id);
  }
} catch (error) {
  console.error('Article could not be loaded.', error);
  container.innerHTML = createErrorState();
}
