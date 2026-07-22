import { escapeHtml, safeImageUrl } from '../utils/html.js';

export function createArticleCard(article) {
  const title = escapeHtml(article.title);
  const imageUrl = safeImageUrl(article.cover_image_url);
  const image = imageUrl
    ? `<img class="article-card__image" data-content-image src="${escapeHtml(imageUrl)}" alt="Cover for ${title}" loading="lazy" width="1600" height="900" /><div class="article-card__fallback" data-image-fallback hidden><i class="bi bi-image" aria-hidden="true"></i><span>Image unavailable</span></div>`
    : '<div class="article-card__fallback"><i class="bi bi-image" aria-hidden="true"></i><span>Image coming soon</span></div>';

  return `
    <div class="col-md-6 col-lg-4">
      <article class="article-card card h-100 border-0">
        <a class="article-card__image-wrap" href="/articles/${encodeURIComponent(article.slug)}" tabindex="-1" aria-hidden="true">${image}</a>
        <div class="card-body d-flex flex-column p-4">
          <p class="article-card__category mb-2">${escapeHtml(article.category?.name || 'Wellbeing')}</p>
          <h3 class="h4 card-title mb-3"><a class="stretched-link" href="/articles/${encodeURIComponent(article.slug)}">${title}</a></h3>
          <p class="card-text text-body-secondary mb-4">${escapeHtml(article.short_description || 'Discover a practical idea for everyday wellbeing.')}</p>
          <span class="article-card__link mt-auto">Read article <i class="bi bi-arrow-up-right" aria-hidden="true"></i></span>
        </div>
      </article>
    </div>`;
}

export function initializeArticleImages(root = document) {
  root.querySelectorAll('[data-content-image]').forEach((image) => {
    const showFallback = () => {
      image.hidden = true;
      image.nextElementSibling?.removeAttribute('hidden');
    };
    image.addEventListener('error', showFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
}
