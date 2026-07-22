import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import '../../styles/content.css';
import './home.css';
import { renderLayout } from '../../components/layout.js';
import { initializeArticleImages } from '../../components/article-card.js';
import { createEmptyState, createErrorState } from '../../components/content-state.js';
import { getFeaturedArticles } from '../../services/article-service.js';
import { buildCategoryTree, getCategories } from '../../services/category-service.js';
import { getCurrentUser } from '../../services/auth-service.js';
import {
  createCategoryGrid,
  createContentAreasSection,
  createFeaturedGrid,
  createFeaturedContentSection,
  createHeroSection,
  createAssessmentPromotionSection,
  createValueSection,
} from './home-sections.js';

const homeContent = [
  createHeroSection(),
  createAssessmentPromotionSection(),
  createContentAreasSection(),
  createFeaturedContentSection(),
  createValueSection(),
].join('');

renderLayout({ activePath: '/', content: homeContent, mainClass: 'home-page' });

const currentUser = await getCurrentUser();
if (currentUser) {
  document.querySelectorAll('[data-assessment-cta]').forEach((link) => { link.href = '/assessment'; });
  document.querySelectorAll('[data-assessment-access]').forEach((note) => { note.innerHTML = '<i class="bi bi-check-circle me-2" aria-hidden="true"></i>Your assessment is ready whenever you are.'; });
  document.querySelectorAll('[data-guest-only]').forEach((element) => element.remove());
}

const categoryGrid = document.querySelector('#category-grid');
const featuredGrid = document.querySelector('#featured-grid');

try {
  const categories = buildCategoryTree(await getCategories());
  categoryGrid.innerHTML = categories.length ? createCategoryGrid(categories) : createEmptyState('No categories yet', 'Wellbeing categories will appear here soon.');
} catch (error) {
  console.error('Categories could not be loaded.', error);
  categoryGrid.innerHTML = createErrorState();
}

try {
  const articles = await getFeaturedArticles(3);
  featuredGrid.innerHTML = articles.length ? createFeaturedGrid(articles) : createEmptyState('No articles yet', 'Fresh practical reading will appear here soon.');
  initializeArticleImages(featuredGrid);
} catch (error) {
  console.error('Featured articles could not be loaded.', error);
  featuredGrid.innerHTML = createErrorState();
}
