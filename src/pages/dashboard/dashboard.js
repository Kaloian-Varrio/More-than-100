import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './dashboard.css';
import { renderLayout } from '../../components/layout.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';
import { getProfile } from '../../services/profile-service.js';
import { createDashboardContent } from './dashboard-view.js';
import { deleteArticle, getCurrentUserArticles } from '../../services/article-service.js';
import { initializeArticleImages } from '../../components/article-card.js';

document.querySelector('#app').innerHTML = `
  <main class="dashboard-loading d-grid min-vh-100" aria-live="polite">
    <div class="text-center">
      <span class="spinner-border text-success mb-3" aria-hidden="true"></span>
      <p class="fw-semibold mb-0">Loading your dashboard...</p>
    </div>
  </main>`;

const user = await requireAuthenticatedUser();

if (user) {
  let profile = null;
  let articles = [];
  let articlesError = false;
  const [profileResult, articlesResult] = await Promise.allSettled([getProfile(user.id), getCurrentUserArticles()]);
  if (profileResult.status === 'fulfilled') profile = profileResult.value;
  else console.warn('Profile details could not be loaded.', profileResult.reason);
  if (articlesResult.status === 'fulfilled') articles = articlesResult.value;
  else {
    console.warn('Articles could not be loaded.', articlesResult.reason);
    articlesError = true;
  }

  renderLayout({ activePath: '/dashboard', content: createDashboardContent(user, profile, articles, articlesError) });
  initializeArticleImages(document.querySelector('#my-articles'));
  document.querySelector('#my-articles')?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-article]');
    if (!button) return;
    const title = button.closest('[data-article-row]')?.querySelector('h3')?.textContent || 'this article';
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;

    button.disabled = true;
    try {
      await deleteArticle(button.dataset.deleteArticle);
      button.closest('[data-article-row]')?.remove();
      const list = document.querySelector('#my-articles-list');
      if (list && !list.querySelector('[data-article-row]')) {
        list.innerHTML = '<div class="article-empty text-center p-5"><i class="bi bi-journal-plus d-block mb-3" aria-hidden="true"></i><h3 class="h5">No articles yet</h3><p class="text-body-secondary mb-3">Create your first article and share it with the community.</p><a class="btn btn-primary" href="/articles/create">Create Article</a></div>';
      }
    } catch (error) {
      window.alert(error.message || 'The article could not be deleted.');
      button.disabled = false;
    }
  });

  if (window.location.hash === '#account') {
    requestAnimationFrame(() => {
      const accountSection = document.querySelector('#account');
      accountSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      accountSection?.focus({ preventScroll: true });
    });
  }
}
