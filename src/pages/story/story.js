import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import '../../styles/content.css';
import '../../styles/stories.css';
import { renderLayout } from '../../components/layout.js';
import { createCompactArticleCard, initializeArticleImages } from '../../components/article-card.js';
import { createEmptyState, createErrorState, createLoadingState } from '../../components/content-state.js';
import { getStoryBySlug } from '../../services/story-service.js';
import { getAllArticles } from '../../services/article-service.js';
import { escapeHtml, safeImageUrl } from '../../utils/html.js';
import { renderRichContent } from '../../utils/rich-content.js';

const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).at(-1) || '');
renderLayout({ activePath: '/stories', mainClass: 'content-page', content: `<section class="container py-5" id="story-content">${createLoadingState('Loading story...')}</section>` });
const container = document.querySelector('#story-content');
try {
  const story = await getStoryBySlug(slug);
  if (!story) container.innerHTML = createEmptyState('Story not found', 'This story may be unpublished or no longer available.');
  else {
    document.title = `${story.title} | More Than 100`;
    const image = safeImageUrl(story.image_url);
    const allArticles = (await getAllArticles()).filter((article) => article.is_published !== false);
    const terms = story.themes.map((theme) => theme.toLowerCase());
    const related = [...allArticles].sort((a, b) => score(b, terms) - score(a, terms)).slice(0, 3);
    container.innerHTML = `<article class="py-lg-4"><nav aria-label="Breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="/">Home</a></li><li class="breadcrumb-item"><a href="/stories">Stories</a></li><li class="breadcrumb-item active" aria-current="page">Story</li></ol></nav><header class="story-body mx-auto text-center mb-5"><p class="section-eyebrow mb-2">${escapeHtml(story.person_name)}</p><h1 class="display-5 fw-bold mb-3">${escapeHtml(story.title)}</h1><p class="lead text-body-secondary">${escapeHtml(story.intro)}</p><div class="d-flex flex-wrap justify-content-center gap-2">${story.themes.map((theme) => `<span class="badge rounded-pill story-theme">${escapeHtml(theme)}</span>`).join('')}</div></header>${image ? `<img class="story-hero-image d-block mx-auto mb-5" src="${escapeHtml(image)}" alt="${escapeHtml(story.title)}" width="1400" height="788">` : ''}<div class="story-body mx-auto">${renderRichContent(story.content)}<aside class="story-disclosure rounded p-3 small mt-5"><strong>Demo story:</strong> This fictional account is provided for inspiration and does not describe a real person or provide medical advice.</aside></div></article>${related.length ? `<section class="border-top py-5 mt-5" aria-labelledby="related-title"><h2 class="h2 mb-4" id="related-title">Related practical reading</h2><div class="row g-4">${related.map(createCompactArticleCard).join('')}</div></section>` : ''}`;
    initializeArticleImages(container);
  }
} catch (error) {
  console.error('Story could not be loaded.', error);
  container.innerHTML = createErrorState();
}

function score(article, terms) {
  const searchable = `${article.title} ${article.short_description || ''} ${article.category?.name || ''}`.toLowerCase();
  return terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
}
