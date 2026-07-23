import { escapeHtml, safeImageUrl } from '../utils/html.js';

export function createStoryCard(story) {
  const imageUrl = safeImageUrl(story.image_url);
  return `
    <div class="col-md-6 col-lg-4">
      <article class="story-card card h-100">
        <a class="story-card__media" href="/stories/${encodeURIComponent(story.slug)}" tabindex="-1" aria-hidden="true">
          ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" loading="lazy" width="1400" height="788" data-story-image>` : createStoryFallback()}
        </a>
        <div class="card-body d-flex flex-column p-4">
          <p class="story-card__person mb-2">${escapeHtml(story.person_name)}</p>
          <h3 class="h4 mb-3"><a class="stretched-link" href="/stories/${encodeURIComponent(story.slug)}">${escapeHtml(story.title)}</a></h3>
          <p class="text-body-secondary mb-4">${escapeHtml(story.intro)}</p>
          <span class="story-card__link mt-auto">Read their story <i class="bi bi-arrow-up-right" aria-hidden="true"></i></span>
        </div>
      </article>
    </div>`;
}

export function initializeStoryImages(root = document) {
  root.querySelectorAll('[data-story-image]').forEach((image) => {
    const fallback = () => image.replaceWith(createFallbackElement());
    image.addEventListener('error', fallback, { once: true });
    requestAnimationFrame(() => { if (image.complete && image.naturalWidth === 0) fallback(); });
  });
}

export function createStoryFallback() {
  return '<div class="story-card__fallback" role="img" aria-label="Story image unavailable"><i class="bi bi-people" aria-hidden="true"></i></div>';
}

function createFallbackElement() {
  const fallback = document.createElement('div');
  fallback.className = 'story-card__fallback';
  fallback.setAttribute('role', 'img');
  fallback.setAttribute('aria-label', 'Story image unavailable');
  fallback.innerHTML = '<i class="bi bi-people" aria-hidden="true"></i>';
  return fallback;
}
