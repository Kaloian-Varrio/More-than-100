import mindfulImage from '../assets/home/mindful-breathing.jpg';
import movementImage from '../assets/home/morning-walk.jpg';
import nutritionImage from '../assets/home/nourishing-breakfast.jpg';
import { escapeHtml, safeImageUrl } from '../utils/html.js';

function getFallbackImage(article) {
  const category = `${article.category?.name || ''} ${article.category?.slug || ''}`.toLowerCase();
  if (/food|drink|water|tea|coffee|herb|fruit|vegetable|dairy|fish|meat|nut|ferment/.test(category)) return nutritionImage;
  if (/mind|breath|sleep|meditat|emotion|sense|social|sharing|family|love|pet/.test(category)) return mindfulImage;
  return movementImage;
}

export function createArticleImage(article, { className = 'article-card__image', loading = 'lazy' } = {}) {
  const title = escapeHtml(article.title);
  const fallbackUrl = getFallbackImage(article);
  const imageUrl = safeImageUrl(article.cover_image_url) || fallbackUrl;
  return `<img class="${className}" data-content-image data-fallback-src="${escapeHtml(fallbackUrl)}" src="${escapeHtml(imageUrl)}" alt="Cover for ${title}" loading="${loading}" width="1600" height="900" />`;
}

export function createArticleCard(article) {
  const title = escapeHtml(article.title);

  return `
    <div class="col-md-6 col-lg-4">
      <article class="article-card card h-100 border-0">
        <a class="article-card__image-wrap" href="/articles/${encodeURIComponent(article.slug)}" tabindex="-1" aria-hidden="true">${createArticleImage(article)}</a>
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
    const useFallback = () => {
      const fallbackUrl = image.dataset.fallbackSrc;
      if (!fallbackUrl || image.dataset.fallbackActive === 'true') return;
      image.dataset.fallbackActive = 'true';
      image.src = fallbackUrl;
    };
    image.addEventListener('error', useFallback);
    requestAnimationFrame(() => {
      if (image.complete && image.naturalWidth === 0) useFallback();
    });
  });
}
