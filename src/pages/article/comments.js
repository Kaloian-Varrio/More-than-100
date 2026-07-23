import { createEmptyState, createErrorState, createLoadingState } from '../../components/content-state.js';
import { getCurrentUser } from '../../services/auth-service.js';
import { getCurrentUserPermissions } from '../../services/role-service.js';
import { createComment, deleteComment, getCommentsForArticle, updateComment } from '../../services/comment-service.js';
import { escapeHtml } from '../../utils/html.js';

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });

function authorName(comment) {
  return comment.author?.nickname
    || [comment.author?.first_name, comment.author?.last_name].filter(Boolean).join(' ')
    || 'More Than 100 member';
}

function setFeedback(container, message = '', type = 'success') {
  container.className = message ? `alert alert-${type} py-2` : 'd-none';
  container.textContent = message;
}

function createCommentMarkup(comment, user, permissions) {
  const ownsComment = permissions?.canComment && user?.id === comment.author_id;
  return `
    <article class="comment-card" data-comment-id="${comment.id}">
      <div class="d-flex flex-column flex-sm-row justify-content-between gap-2 mb-3">
        <div><p class="comment-author mb-1"><i class="bi bi-person-circle me-2" aria-hidden="true"></i>${escapeHtml(authorName(comment))}</p><time class="small text-body-secondary" datetime="${comment.created_at}">${dateFormatter.format(new Date(comment.created_at))}</time></div>
        ${ownsComment ? `<div class="comment-actions d-flex gap-2"><button class="btn btn-sm btn-outline-primary" type="button" data-comment-edit><i class="bi bi-pencil me-1" aria-hidden="true"></i>Edit</button><button class="btn btn-sm btn-outline-danger" type="button" data-comment-delete><i class="bi bi-trash me-1" aria-hidden="true"></i>Delete</button></div>` : ''}
      </div>
      <p class="comment-text mb-0">${escapeHtml(comment.content)}</p>
    </article>`;
}

export async function initializeComments(articleId) {
  const section = document.querySelector('#comments-section');
  if (!section) return;

  const composer = section.querySelector('#comment-composer');
  const list = section.querySelector('#comment-list');
  const feedback = section.querySelector('#comment-feedback');
  let user = null;
  let permissions = null;
  let comments = [];

  try {
    user = await getCurrentUser();
    if (user) permissions = await getCurrentUserPermissions();
  } catch (error) {
    console.error('Comment authentication state could not be loaded.', error);
  }

  if (user && permissions.canComment) {
    composer.innerHTML = `
      <form class="comment-form card border-0 p-3 p-sm-4" id="comment-form" novalidate>
        <label class="form-label fw-semibold" for="comment-content">Join the conversation</label>
        <textarea class="form-control" id="comment-content" name="content" rows="4" maxlength="2000" required placeholder="Share a thoughtful comment..."></textarea>
        <div class="invalid-feedback">Write a comment before submitting.</div>
        <div class="d-flex justify-content-end mt-3"><button class="btn btn-primary" type="submit"><i class="bi bi-send me-2" aria-hidden="true"></i>Post comment</button></div>
      </form>`;
  } else if (user) {
    composer.innerHTML = '<div class="comment-guest card border-0 p-4"><p class="mb-0"><i class="bi bi-eye me-2" aria-hidden="true"></i>Your Reader account can follow the conversation but cannot post or manage comments.</p></div>';
  } else {
    composer.innerHTML = '<div class="comment-guest card border-0 p-4"><p class="mb-3"><i class="bi bi-chat-heart me-2" aria-hidden="true"></i>Join the conversation by signing in or creating an account.</p><div class="d-flex flex-column flex-sm-row gap-2"><a class="btn btn-primary" href="/login">Login</a><a class="btn btn-outline-primary" href="/register">Register</a></div></div>';
  }

  const loadComments = async () => {
    list.innerHTML = createLoadingState('Loading comments...');
    try {
      comments = await getCommentsForArticle(articleId);
      list.innerHTML = comments.length
        ? comments.map((comment) => createCommentMarkup(comment, user, permissions)).join('')
        : createEmptyState('No comments yet', 'Be the first to share a thoughtful response.');
    } catch (error) {
      console.error('Comments could not be loaded.', error);
      list.innerHTML = createErrorState();
    }
  };

  composer.querySelector('#comment-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const content = form.elements.content.value.trim();
    form.classList.add('was-validated');
    if (!content) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setFeedback(feedback);
    try {
      await createComment({ articleId, authorId: user.id, content });
      form.reset();
      form.classList.remove('was-validated');
      await loadComments();
      setFeedback(feedback, 'Your comment was posted.');
    } catch (error) {
      console.error('Comment could not be created.', error);
      setFeedback(feedback, 'Your comment could not be posted. Please try again.', 'danger');
    } finally {
      button.disabled = false;
    }
  });

  list.addEventListener('click', async (event) => {
    const card = event.target.closest('[data-comment-id]');
    if (!card || !user || !permissions?.canComment) return;
    const comment = comments.find(({ id }) => id === card.dataset.commentId);
    if (!comment || comment.author_id !== user.id) return;

    if (event.target.closest('[data-comment-edit]')) {
      card.innerHTML = `
        <form data-comment-edit-form novalidate>
          <label class="form-label fw-semibold" for="edit-${comment.id}">Edit your comment</label>
          <textarea class="form-control" id="edit-${comment.id}" name="content" rows="3" maxlength="2000" required>${escapeHtml(comment.content)}</textarea>
          <div class="invalid-feedback">Your comment cannot be empty.</div>
          <div class="d-flex flex-wrap gap-2 mt-3"><button class="btn btn-primary btn-sm" type="submit">Save changes</button><button class="btn btn-outline-secondary btn-sm" type="button" data-comment-cancel>Cancel</button></div>
        </form>`;
      card.querySelector('textarea').focus();
    }

    if (event.target.closest('[data-comment-delete]')) {
      if (!window.confirm('Delete this comment? This cannot be undone.')) return;
      event.target.closest('button').disabled = true;
      try {
        await deleteComment({ commentId: comment.id, authorId: user.id });
        await loadComments();
        setFeedback(feedback, 'Your comment was deleted.');
      } catch (error) {
        console.error('Comment could not be deleted.', error);
        setFeedback(feedback, 'Your comment could not be deleted. Please try again.', 'danger');
      }
    }

    if (event.target.closest('[data-comment-cancel]')) card.outerHTML = createCommentMarkup(comment, user, permissions);
  });

  list.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-comment-edit-form]');
    if (!form || !user || !permissions?.canComment) return;
    event.preventDefault();
    const card = form.closest('[data-comment-id]');
    const comment = comments.find(({ id }) => id === card.dataset.commentId);
    const content = form.elements.content.value.trim();
    form.classList.add('was-validated');
    if (!comment || comment.author_id !== user.id || !content) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await updateComment({ commentId: comment.id, authorId: user.id, content });
      await loadComments();
      setFeedback(feedback, 'Your comment was updated.');
    } catch (error) {
      console.error('Comment could not be updated.', error);
      button.disabled = false;
      setFeedback(feedback, 'Your comment could not be updated. Please try again.', 'danger');
    }
  });

  await loadComments();
}
