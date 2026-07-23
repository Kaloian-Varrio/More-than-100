import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './dashboard.css';
import { renderLayout } from '../../components/layout.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';
import { getProfile } from '../../services/profile-service.js';
import { createDashboardContent } from './dashboard-view.js';
import { deleteArticle, getCurrentUserArticles } from '../../services/article-service.js';
import { initializeArticleImages } from '../../components/article-card.js';
import { initializeProfileAvatars } from '../../components/profile-avatar.js';
import { getCurrentUserComments, deleteComment, updateComment } from '../../services/comment-service.js';
import { getCurrentUserAssessmentResults } from '../../services/assessment-service.js';
import { getAssessmentRecommendations } from '../../services/recommendation-service.js';
import { getRiskLabel } from '../assessment/assessment-scoring.js';
import { escapeHtml } from '../../utils/html.js';
import { getCurrentUserPermissions } from '../../services/role-service.js';

document.querySelector('#app').innerHTML = `
  <main class="dashboard-loading d-grid min-vh-100" aria-live="polite">
    <div class="text-center">
      <span class="spinner-border text-success mb-3" aria-hidden="true"></span>
      <p class="fw-semibold mb-0">Loading your dashboard...</p>
    </div>
  </main>`;

const user = await requireAuthenticatedUser();

if (user) {
  const permissions = await getCurrentUserPermissions();
  let profile = null;
  let articles = [];
  let comments = [];
  let assessmentResults = [];
  const errors = { articlesError: false, commentsError: false, assessmentError: false, recommendationsError: false };
  const [profileResult, articlesResult, commentsResult, assessmentResult] = await Promise.allSettled([
    getProfile(user.id),
    getCurrentUserArticles(),
    getCurrentUserComments(),
    getCurrentUserAssessmentResults(),
  ]);
  if (profileResult.status === 'fulfilled') profile = profileResult.value;
  else console.warn('Profile details could not be loaded.', profileResult.reason);
  if (articlesResult.status === 'fulfilled') articles = articlesResult.value;
  else {
    console.warn('Articles could not be loaded.', articlesResult.reason);
    errors.articlesError = true;
  }
  if (commentsResult.status === 'fulfilled') comments = commentsResult.value;
  else {
    console.warn('Comments could not be loaded.', commentsResult.reason);
    errors.commentsError = true;
  }
  if (assessmentResult.status === 'fulfilled') assessmentResults = assessmentResult.value;
  else {
    console.warn('Assessment results could not be loaded.', assessmentResult.reason);
    errors.assessmentError = true;
  }

  let recommendations = [];
  if (assessmentResults.length) {
    const latest = assessmentResults[0];
    const scores = {
      stress: { score: latest.stress_score, label: getRiskLabel(latest.stress_score) },
      sedentary: { score: latest.sedentary_score, label: getRiskLabel(latest.sedentary_score) },
      social: { score: latest.social_score, label: getRiskLabel(latest.social_score) },
    };
    try {
      recommendations = await getAssessmentRecommendations(scores, 5);
    } catch (error) {
      console.warn('Recommendations could not be loaded.', error);
      errors.recommendationsError = true;
    }
  }

  renderLayout({
    activePath: '/dashboard',
    content: createDashboardContent(user, profile, { articles, comments, assessmentResults, recommendations, permissions, ...errors }),
  });
  initializeArticleImages(document.querySelector('#my-articles'));
  initializeArticleImages(document.querySelector('#dashboard-recommendations'));
  initializeProfileAvatars(document.querySelector('#account'));
  if (permissions.canCreateContent) document.querySelector('#my-articles')?.addEventListener('click', async (event) => {
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
  if (permissions.canComment) initializeDashboardComments(user, comments);

  if (window.location.hash === '#account') {
    requestAnimationFrame(() => {
      const accountSection = document.querySelector('#account');
      accountSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      accountSection?.focus({ preventScroll: true });
    });
  }
}

function initializeDashboardComments(user, comments) {
  const list = document.querySelector('#my-comments-list');
  const feedback = document.querySelector('#comments-feedback');
  if (!list || !feedback) return;

  const setFeedback = (message, type = 'success') => {
    feedback.className = `alert alert-${type} mt-3`;
    feedback.textContent = message;
  };

  list.addEventListener('click', async (event) => {
    const row = event.target.closest('[data-comment-row]');
    if (!row) return;
    const comment = comments.find(({ id }) => id === row.dataset.commentRow);
    if (!comment || comment.author_id !== user.id) return;

    if (event.target.closest('[data-edit-comment]')) {
      row.originalMarkup = row.innerHTML;
      row.innerHTML = `<form data-dashboard-comment-form novalidate><label class="form-label fw-semibold" for="dashboard-comment-${comment.id}">Edit your comment</label><textarea class="form-control" id="dashboard-comment-${comment.id}" name="content" rows="3" maxlength="2000" required>${escapeHtml(comment.content)}</textarea><div class="invalid-feedback">Your comment cannot be empty.</div><div class="d-flex flex-wrap gap-2 mt-3"><button class="btn btn-primary btn-sm" type="submit">Save changes</button><button class="btn btn-outline-secondary btn-sm" type="button" data-cancel-comment>Cancel</button></div></form>`;
      row.querySelector('textarea').focus();
      return;
    }

    if (event.target.closest('[data-cancel-comment]')) {
      row.innerHTML = row.originalMarkup;
      return;
    }

    const deleteButton = event.target.closest('[data-delete-comment]');
    if (!deleteButton || !window.confirm('Delete this comment? This cannot be undone.')) return;
    deleteButton.disabled = true;
    try {
      await deleteComment({ commentId: comment.id, authorId: user.id });
      comments.splice(comments.indexOf(comment), 1);
      row.remove();
      if (!list.querySelector('[data-comment-row]')) list.innerHTML = '<div class="article-empty text-center p-5"><i class="bi bi-chat-square-text d-block mb-3" aria-hidden="true"></i><h3 class="h5">No comments yet</h3><p class="text-body-secondary mb-0">Comments you add to articles will appear here.</p></div>';
      setFeedback('Your comment was deleted.');
    } catch (error) {
      console.error('Comment could not be deleted.', error);
      deleteButton.disabled = false;
      setFeedback('Your comment could not be deleted. Please try again.', 'danger');
    }
  });

  list.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-dashboard-comment-form]');
    if (!form) return;
    event.preventDefault();
    const row = form.closest('[data-comment-row]');
    const comment = comments.find(({ id }) => id === row.dataset.commentRow);
    const content = form.elements.content.value.trim();
    form.classList.add('was-validated');
    if (!comment || comment.author_id !== user.id || !content) return;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      await updateComment({ commentId: comment.id, authorId: user.id, content });
      comment.content = content;
      row.innerHTML = row.originalMarkup;
      row.querySelector('.dashboard-comment__text').textContent = content;
      row.originalMarkup = row.innerHTML;
      setFeedback('Your comment was updated.');
    } catch (error) {
      console.error('Comment could not be updated.', error);
      button.disabled = false;
      setFeedback('Your comment could not be updated. Please try again.', 'danger');
    }
  });
}
