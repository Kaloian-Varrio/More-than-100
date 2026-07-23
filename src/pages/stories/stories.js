import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import '../../styles/stories.css';
import { renderLayout } from '../../components/layout.js';
import { createStoryCard, initializeStoryImages } from '../../components/story-card.js';
import { createEmptyState, createErrorState, createLoadingState } from '../../components/content-state.js';
import { getPublishedStories } from '../../services/story-service.js';

renderLayout({ activePath: '/stories', mainClass: 'stories-page', content: `
  <section class="stories-hero py-5 py-lg-6"><div class="container"><div class="stories-hero__copy py-lg-4"><p class="section-eyebrow mb-2">Realistic paths, human scale</p><h1 class="display-4 fw-bold mb-3">Stories of small choices that add up.</h1><p class="lead text-body-secondary mb-0">Meet fictional people created to demonstrate how practical routines, patience and connection can support wellbeing at different stages of life.</p></div></div></section>
  <section class="container py-5 py-lg-6" aria-labelledby="stories-title"><div class="d-flex justify-content-between align-items-end mb-4"><div><h2 class="h1 mb-2" id="stories-title">Latest stories</h2><p class="text-body-secondary mb-0">Ideas for inspiration, never medical advice.</p></div></div><div class="row g-4" id="stories-grid">${createLoadingState('Loading stories...')}</div></section>` });

const grid = document.querySelector('#stories-grid');
try {
  const stories = await getPublishedStories();
  grid.innerHTML = stories.length ? stories.map(createStoryCard).join('') : createEmptyState('No stories yet', 'New stories will appear here soon.');
  initializeStoryImages(grid);
} catch (error) {
  console.error('Stories could not be loaded.', error);
  grid.innerHTML = createErrorState();
}
