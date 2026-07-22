import mindfulImage from '../assets/home/mindful-breathing.jpg';
import movementImage from '../assets/home/morning-walk.jpg';
import nutritionImage from '../assets/home/nourishing-breakfast.jpg';
import sleepImage from '../assets/articles/sleep-rhythm.jpg';
import { escapeHtml, safeImageUrl } from '../utils/html.js';

const articleVisuals = {
  'build-regular-sleep-rhythm': ['moon-stars', 'Restful sleep', 'night'],
  'cold-exposure-basics-beginners': ['snow', 'Cold therapy', 'ice'],
  'hydration-everyday-habit': ['droplet', 'Daily hydration', 'water'],
  'make-more-room-for-nature': ['tree', 'Time in nature', 'nature'],
  'stretching-after-long-sitting': ['activity', 'Gentle stretching', 'energy'],
  'social-connection-everyday-life': ['people', 'Social connection', 'warmth'],
  'fermented-foods-familiar-meals': ['basket2', 'Fermented foods', 'food'],
  'pets-daily-presence': ['heart', 'Life with pets', 'warmth'],
  'running-conversational-pace': ['person-running', 'Easy running', 'energy'],
  'create-quiet-tea-ritual': ['cup-hot', 'A quiet tea ritual', 'food'],
  'share-food-time-attention': ['people', 'Sharing together', 'warmth'],
  'gentle-ten-minute-yoga-reset': ['activity', 'Gentle yoga', 'nature'],
};

const relevantLocalImages = {
  'build-regular-sleep-rhythm': sleepImage,
  'short-morning-walk-start-day': movementImage,
  'simple-breathing-pause-busy-moments': mindfulImage,
  'colorful-bowl-everyday-vegetables': nutritionImage,
};

function getArticleVisual(article) {
  return articleVisuals[article.slug] || ['image', article.category?.name || 'Wellbeing', 'nature'];
}

function createFallbackVisual(article, detail = false) {
  const [icon, label, theme] = getArticleVisual(article);
  return `<div class="article-image-visual article-image-visual--${theme}${detail ? ' article-image-visual--detail' : ''}" data-article-visual role="img" aria-label="${escapeHtml(label)}"><i class="bi bi-${icon}" aria-hidden="true"></i><span>${escapeHtml(label)}</span></div>`;
}

function isPlaceholderImageUrl(imageUrl) {
  if (!imageUrl) return false;
  try {
    return ['placehold.co', 'placehold.it', 'via.placeholder.com'].includes(new URL(imageUrl).hostname);
  } catch {
    return false;
  }
}

export function createArticleImage(article, { className = 'article-card__image', loading = 'lazy' } = {}) {
  const title = escapeHtml(article.title);
  const safeCoverUrl = safeImageUrl(article.cover_image_url);
  const isDetail = className.includes('article-cover');
  const localImage = relevantLocalImages[article.slug];

  if ((!safeCoverUrl || isPlaceholderImageUrl(safeCoverUrl)) && !localImage) {
    return createFallbackVisual(article, isDetail);
  }

  const imageUrl = safeCoverUrl && !isPlaceholderImageUrl(safeCoverUrl) ? safeCoverUrl : localImage;
  const [fallbackIcon, fallbackLabel, fallbackTheme] = getArticleVisual(article);
  return `<img class="${className}" data-content-image data-fallback-icon="${fallbackIcon}" data-fallback-label="${escapeHtml(fallbackLabel)}" data-fallback-theme="${fallbackTheme}" src="${escapeHtml(imageUrl)}" alt="Cover for ${title}" loading="${loading}" width="1600" height="900" />`;
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
      if (image.dataset.fallbackActive === 'true') return;
      const visual = document.createElement('div');
      visual.className = `article-image-visual article-image-visual--${image.dataset.fallbackTheme || 'nature'}${image.classList.contains('article-cover') ? ' article-image-visual--detail' : ''}`;
      visual.dataset.articleVisual = '';
      visual.setAttribute('role', 'img');
      visual.setAttribute('aria-label', image.dataset.fallbackLabel || 'Article image');
      const icon = document.createElement('i');
      icon.className = `bi bi-${image.dataset.fallbackIcon || 'image'}`;
      icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = image.dataset.fallbackLabel || 'Article image';
      visual.append(icon, label);
      image.dataset.fallbackActive = 'true';
      image.replaceWith(visual);
    };
    image.addEventListener('error', useFallback);
    requestAnimationFrame(() => {
      if (image.complete && image.naturalWidth === 0) useFallback();
    });
  });
}
