import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './admin.css';
import { Modal } from 'bootstrap';
import { renderLayout } from '../../components/layout.js';
import { createProfileAvatar, initializeProfileAvatars } from '../../components/profile-avatar.js';
import { createArticleImage, initializeArticleImages } from '../../components/article-card.js';
import { requireAdminUser } from '../../services/role-service.js';
import {
  deleteArticleAsAdmin,
  deleteCommentAsAdmin,
  deleteUserAsAdmin,
  getAdminOverviewData,
  setArticlePublishedAsAdmin,
  setUserRoleAsAdmin,
  updateCommentAsAdmin,
  updateProfileAsAdmin,
} from '../../services/admin-service.js';
import { initializeBrandLogos, uploadBrandLogo, validateBrandLogo } from '../../services/brand-logo-service.js';
import { escapeHtml } from '../../utils/html.js';
import { deleteStory, setStoryPublished } from '../../services/story-service.js';

document.querySelector('#app').innerHTML = '<main class="d-grid min-vh-100" style="place-items:center"><span class="spinner-border text-success" aria-label="Loading admin panel"></span></main>';
const currentAdmin = await requireAdminUser();
if (currentAdmin) loadAdmin();

async function loadAdmin(message) {
  try {
    const data = await getAdminOverviewData();
    renderAdmin(data);
    if (message) feedback(message);
  } catch (error) {
    console.error('Admin data could not be loaded.', error);
    renderLayout({
      activePath: '/admin',
      mainClass: 'admin-page',
      content: '<section class="container py-5 text-center"><h1 class="h2">Admin Panel unavailable</h1><p class="text-body-secondary">Management data could not be loaded. Please refresh and try again.</p></section>',
    });
  }
}

function renderAdmin(data) {
  renderLayout({
    activePath: '/admin',
    mainClass: 'admin-page',
    content: `
      <section class="admin-hero py-5">
        <div class="container">
          <p class="text-uppercase small fw-bold mb-2">Administration</p>
          <h1 class="display-6 fw-bold mb-2">Admin Panel</h1>
          <p class="mb-0 opacity-75">Manage users, community content and site branding.</p>
        </div>
      </section>
      <div class="container py-5">
        <div class="alert d-none" id="admin-feedback" role="status"></div>
        <section class="row g-3 mb-5" aria-label="Overview">
          ${stat('people', 'Users', data.profiles.length)}
          ${stat('journal-text', 'Articles', data.articles.length)}
          ${stat('people-fill', 'Stories', data.stories.length)}
          ${stat('chat-square-text', 'Comments', data.comments.length)}
        </section>
        <nav class="nav nav-pills flex-nowrap gap-2 mb-4 admin-nav" aria-label="Admin sections">
          <a class="nav-link active" href="#users">Users</a>
          <a class="nav-link" href="#articles">Articles</a>
          <a class="nav-link" href="#stories">Stories</a>
          <a class="nav-link" href="#comments">Comments</a>
          <a class="nav-link" href="#branding">Branding</a>
        </nav>
        ${usersSection(data.profiles)}
        ${articlesSection(data.articles)}
        ${storiesSection(data.stories)}
        ${commentsSection(data.comments)}
        ${brandingSection()}
      </div>
      ${profileModal()}
      ${commentModal()}`,
  });

  initializeProfileAvatars(document.querySelector('#users'));
  initializeArticleImages(document.querySelector('#articles'));
  initializeActions(data);
  initializeBranding();
}

function stat(icon, label, value) {
  return `<div class="col-6 col-xl-3"><article class="card admin-stat h-100"><div class="card-body d-flex align-items-center gap-3"><span class="admin-stat__icon"><i class="bi bi-${icon}" aria-hidden="true"></i></span><div><strong class="h3 d-block mb-0">${value}</strong><span class="text-body-secondary">${label}</span></div></div></article></div>`;
}

function usersSection(profiles) {
  const adminCount = profiles.filter(({ role }) => role === 'admin').length;
  const body = profiles.length ? `
    <div class="table-responsive">
      <table class="table table-hover align-middle admin-table mb-0">
        <thead><tr><th>User</th><th>Email</th><th>Nickname</th><th>Role</th><th class="text-end">Actions</th></tr></thead>
        <tbody>
          ${profiles.map((profile) => `
            <tr data-profile-id="${profile.id}">
              <td><div class="d-flex align-items-center gap-2">${createProfileAvatar(profile, null, 'admin-avatar')}<span>${escapeHtml(fullName(profile))}</span></div></td>
              <td><span class="text-break">${escapeHtml(profile.email || 'Unavailable')}</span></td>
              <td>${escapeHtml(profile.nickname || '—')}</td>
              <td>
                <div class="admin-role-control" data-current-role="${escapeHtml(profile.role)}">
                  <span class="badge text-bg-${profile.role === 'admin' ? 'success' : profile.role === 'reader' ? 'info' : 'secondary'} mb-2">Current: ${escapeHtml(roleLabel(profile.role))}</span>
                  <div class="input-group input-group-sm">
                    <label class="visually-hidden" for="role-${profile.id}">Role for ${escapeHtml(fullName(profile))}</label>
                    <select class="form-select" id="role-${profile.id}" data-role-select>
                      ${roleOption('reader', profile.role, profile.role === 'admin' && adminCount === 1)}
                      ${roleOption('user', profile.role, profile.role === 'admin' && adminCount === 1)}
                      ${roleOption('admin', profile.role)}
                    </select>
                    <button class="btn btn-outline-success" type="button" data-save-role disabled>Update</button>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex flex-wrap justify-content-end gap-2">
                  <button class="btn btn-sm btn-outline-primary" data-edit-profile><i class="bi bi-pencil me-1" aria-hidden="true"></i>Edit profile</button>
                  <button class="btn btn-sm btn-outline-danger" data-delete-user${profile.id === currentAdmin.id ? ' disabled title="You cannot delete your active account."' : ''}><i class="bi bi-person-x me-1" aria-hidden="true"></i>Delete user</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : empty('No users found.');
  return panel('users', 'Users and profiles', body, 'Roles are changed through the secure Admin service. The last administrator cannot be demoted.');
}

function roleOption(role, currentRole, disabled = false) {
  return `<option value="${role}"${role === currentRole ? ' selected' : ''}${disabled ? ' disabled' : ''}>${roleLabel(role)}</option>`;
}

function roleLabel(role) {
  return ({ reader: 'Reader', user: 'User', admin: 'Admin' })[role] || role;
}

function articlesSection(articles) {
  const body = articles.length ? `
    <div class="table-responsive">
      <table class="table table-hover align-middle admin-table mb-0">
        <thead><tr><th>Article</th><th>Author</th><th>Visibility</th><th>Created</th><th class="text-end">Actions</th></tr></thead>
        <tbody>
          ${articles.map((article) => `
            <tr data-article-id="${article.id}">
              <td><div class="d-flex align-items-center gap-3"><div class="admin-article-thumb">${createArticleImage(article, { className: 'admin-article-thumb__image' })}</div><span class="fw-semibold">${escapeHtml(article.title)}</span></div></td>
              <td>${escapeHtml(displayName(article.author))}</td>
              <td><span class="badge ${article.is_published ? 'text-bg-success' : 'text-bg-secondary'}" data-visibility-badge>${article.is_published ? 'Published' : 'Unpublished'}</span></td>
              <td>${date(article.created_at)}</td>
              <td><div class="d-flex flex-wrap justify-content-end gap-2">
                <a class="btn btn-sm btn-outline-primary" href="/articles/${encodeURIComponent(article.slug)}">View</a>
                <a class="btn btn-sm btn-outline-secondary" href="/articles/${encodeURIComponent(article.slug)}/edit">Edit</a>
                <button class="btn btn-sm btn-outline-warning" data-toggle-published data-published="${article.is_published}">${article.is_published ? 'Unpublish' : 'Publish'}</button>
                <button class="btn btn-sm btn-outline-danger" data-delete-article>Delete</button>
              </div></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : empty('No articles found.');
  return panel('articles', 'Articles', body, 'Unpublished articles remain available to their author and administrators.');
}

function storiesSection(stories) {
  const body = stories.length ? `
    <div class="p-4 border-bottom text-end"><a class="btn btn-primary" href="/admin/stories/create"><i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Create story</a></div>
    <div class="table-responsive"><table class="table table-hover align-middle admin-table mb-0"><thead><tr><th>Story</th><th>Person</th><th>Visibility</th><th>Created</th><th class="text-end">Actions</th></tr></thead><tbody>
    ${stories.map((story) => `<tr data-story-id="${story.id}"><td><div class="d-flex align-items-center gap-3"><img class="admin-story-thumb" src="${escapeHtml(story.image_url)}" alt="" width="96" height="54"><span class="fw-semibold">${escapeHtml(story.title)}</span></div></td><td>${escapeHtml(story.person_name)}</td><td><span class="badge ${story.is_published ? 'text-bg-success' : 'text-bg-secondary'}">${story.is_published ? 'Published' : 'Unpublished'}</span></td><td>${date(story.created_at)}</td><td><div class="d-flex flex-wrap justify-content-end gap-2"><a class="btn btn-sm btn-outline-primary" href="/stories/${encodeURIComponent(story.slug)}">View</a><a class="btn btn-sm btn-outline-secondary" href="/admin/stories/${encodeURIComponent(story.slug)}/edit">Edit</a><button class="btn btn-sm btn-outline-warning" data-toggle-story data-published="${story.is_published}">${story.is_published ? 'Unpublish' : 'Publish'}</button><button class="btn btn-sm btn-outline-danger" data-delete-story>Delete</button></div></td></tr>`).join('')}
    </tbody></table></div>` : `<div class="p-4 border-bottom text-end"><a class="btn btn-primary" href="/admin/stories/create">Create story</a></div>${empty('No stories found.')}`;
  return panel('stories', 'Stories', body, 'Create, edit and control publication of story content.');
}

function commentsSection(comments) {
  const body = comments.length ? `
    <div class="table-responsive">
      <table class="table table-hover align-middle admin-table mb-0">
        <thead><tr><th>Author</th><th>Article</th><th>Comment</th><th>Created</th><th class="text-end">Actions</th></tr></thead>
        <tbody>
          ${comments.map((comment) => `
            <tr data-comment-id="${comment.id}">
              <td>${escapeHtml(displayName(comment.author))}</td>
              <td>${escapeHtml(comment.article?.title || 'Deleted article')}</td>
              <td class="admin-comment" data-comment-content>${escapeHtml(comment.content)}</td>
              <td>${date(comment.created_at)}</td>
              <td><div class="d-flex flex-wrap justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-primary" data-edit-comment>Edit</button>
                <button class="btn btn-sm btn-outline-danger" data-delete-comment>Delete</button>
              </div></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : empty('No comments found.');
  return panel('comments', 'Comment moderation', body);
}

function brandingSection() {
  return `
    <section class="card admin-panel admin-section mb-4" id="branding">
      <div class="card-body p-4 p-lg-5">
        <div class="row g-4 g-lg-5 align-items-start">
          <div class="col-lg-5">
            <p class="text-uppercase small fw-bold text-success mb-2">Site settings</p>
            <h2 class="h4 mb-2">Brand logo</h2>
            <p class="text-body-secondary mb-4">This logo appears throughout the public site. The original 100+ mark is the automatic fallback.</p>
            <div class="admin-logo-current" data-brand-identity>
              <span class="brand-mark" aria-hidden="true" data-brand-fallback>100<span>+</span></span>
              <img class="admin-logo-current__image" alt="Current More Than 100 logo" data-brand-logo hidden>
            </div>
            <p class="small text-body-secondary mt-2 mb-0">Current site logo</p>
          </div>
          <div class="col-lg-7">
            <form id="branding-form" novalidate>
              <label class="form-label fw-semibold" for="brand-logo-file">Choose a replacement logo</label>
              <input class="form-control" id="brand-logo-file" name="brandLogo" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="brand-logo-help brand-logo-feedback" required>
              <div class="form-text" id="brand-logo-help">PNG, JPEG or WebP, up to 1 MB.</div>
              <div class="admin-logo-preview mt-3 d-none" id="brand-logo-preview-wrap"><img id="brand-logo-preview" alt="Selected logo preview"></div>
              <p class="small mt-3 mb-0" id="brand-logo-feedback" role="status" aria-live="polite"></p>
              <button class="btn btn-primary mt-3" type="submit" disabled><i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>Save logo</button>
            </form>
          </div>
        </div>
      </div>
    </section>`;
}

function panel(id, title, body, note = '') {
  return `<section class="card admin-panel admin-section mb-4" id="${id}"><div class="card-body p-0"><div class="p-4 border-bottom"><h2 class="h4 mb-${note ? '1' : '0'}">${title}</h2>${note ? `<p class="small text-body-secondary mb-0">${note}</p>` : ''}</div>${body}</div></section>`;
}

function empty(message) {
  return `<div class="text-center text-body-secondary p-5"><i class="bi bi-inbox d-block h2" aria-hidden="true"></i>${message}</div>`;
}

function profileModal() {
  return `<div class="modal fade" id="profile-modal" tabindex="-1" aria-labelledby="profile-modal-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><form id="admin-profile-form"><div class="modal-header"><h2 class="modal-title h5" id="profile-modal-title">Edit profile</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><input name="profileId" type="hidden"><div class="row g-3"><div class="col-sm-6"><label class="form-label" for="admin-first-name">First name</label><input class="form-control" id="admin-first-name" name="firstName" maxlength="80"></div><div class="col-sm-6"><label class="form-label" for="admin-last-name">Last name</label><input class="form-control" id="admin-last-name" name="lastName" maxlength="80"></div><div class="col-12"><label class="form-label" for="admin-nickname">Nickname</label><input class="form-control" id="admin-nickname" name="nickname" required maxlength="40"></div><div class="col-12"><label class="form-label" for="admin-bio">Bio</label><textarea class="form-control" id="admin-bio" name="bio" rows="4" maxlength="600"></textarea></div></div></div><div class="modal-footer admin-modal-actions"><button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" type="submit">Save changes</button></div></form></div></div></div>`;
}

function commentModal() {
  return `<div class="modal fade" id="comment-modal" tabindex="-1" aria-labelledby="comment-modal-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><form id="admin-comment-form"><div class="modal-header"><h2 class="modal-title h5" id="comment-modal-title">Edit comment</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><input name="commentId" type="hidden"><label class="form-label" for="admin-comment-content">Comment</label><textarea class="form-control" id="admin-comment-content" name="content" rows="5" maxlength="2000" required></textarea></div><div class="modal-footer admin-modal-actions"><button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" type="submit">Save comment</button></div></form></div></div></div>`;
}

function initializeActions(data) {
  initializeProfileActions(data);
  initializeUserActions(data);
  initializeRoleActions(data);
  initializeArticleActions();
  initializeStoryActions();
  initializeCommentActions(data);
}

function initializeRoleActions(data) {
  const section = document.querySelector('#users');
  section.querySelectorAll('[data-role-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const control = select.closest('[data-current-role]');
      control.querySelector('[data-save-role]').disabled = select.value === control.dataset.currentRole;
    });
  });
  section.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-save-role]');
    if (!button) return;
    const row = button.closest('tr[data-profile-id]');
    const control = button.closest('[data-current-role]');
    const select = control.querySelector('[data-role-select]');
    const profile = data.profiles.find(({ id }) => id === row.dataset.profileId);
    const currentRole = control.dataset.currentRole;
    const nextRole = select.value;
    if (!profile || nextRole === currentRole) return;
    if (nextRole === 'admin' && !window.confirm('Promote this user to Admin? This will grant full administrative access.')) {
      select.value = currentRole;
      button.disabled = true;
      return;
    }
    if (currentRole === 'admin' && nextRole !== 'admin' && !window.confirm('Remove Admin access from this user?')) {
      select.value = currentRole;
      button.disabled = true;
      return;
    }
    button.disabled = true;
    select.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Updating';
    try {
      await setUserRoleAsAdmin(profile.id, nextRole);
      await loadAdmin(`${displayName(profile)} is now ${roleLabel(nextRole)}.`);
    } catch (error) {
      console.error('Role update failed.', error);
      select.disabled = false;
      select.value = currentRole;
      button.textContent = 'Update';
      button.disabled = true;
      feedback(error.message || 'The role could not be updated.', 'danger');
    }
  });
}

function initializeStoryActions() {
  document.querySelector('#stories').addEventListener('click', async (event) => {
    const row = event.target.closest('tr[data-story-id]');
    if (!row) return;
    const toggle = event.target.closest('[data-toggle-story]');
    if (toggle) {
      const published = toggle.dataset.published === 'true';
      if (!window.confirm(`${published ? 'Unpublish' : 'Publish'} this story?`)) return;
      toggle.disabled = true;
      try {
        await setStoryPublished(row.dataset.storyId, !published);
        await loadAdmin(`Story ${published ? 'unpublished' : 'published'} successfully.`);
      } catch (error) {
        console.error('Story visibility update failed.', error);
        toggle.disabled = false;
        feedback(error.message || 'Story visibility could not be changed.', 'danger');
      }
      return;
    }
    const button = event.target.closest('[data-delete-story]');
    if (!button || !window.confirm('Delete this story permanently?')) return;
    button.disabled = true;
    try {
      await deleteStory(row.dataset.storyId);
      await loadAdmin('Story deleted successfully.');
    } catch (error) {
      console.error('Story deletion failed.', error);
      button.disabled = false;
      feedback(error.message || 'The story could not be deleted.', 'danger');
    }
  });
}

function initializeProfileActions(data) {
  const element = document.querySelector('#profile-modal');
  const modal = new Modal(element);
  const form = document.querySelector('#admin-profile-form');
  document.querySelector('#users').addEventListener('click', (event) => {
    const button = event.target.closest('[data-edit-profile]');
    if (!button) return;
    const profile = data.profiles.find(({ id }) => id === button.closest('tr').dataset.profileId);
    form.elements.profileId.value = profile.id;
    form.elements.firstName.value = profile.first_name || '';
    form.elements.lastName.value = profile.last_name || '';
    form.elements.nickname.value = profile.nickname || '';
    form.elements.bio.value = profile.bio || '';
    modal.show();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const values = Object.fromEntries(new FormData(form));
      await updateProfileAsAdmin(values.profileId, values);
      modal.hide();
      await loadAdmin('Profile updated successfully.');
    } catch (error) {
      console.error('Admin profile update failed.', error);
      feedback(error.message || 'The profile could not be updated.', 'danger');
      button.disabled = false;
    }
  });
}

function initializeUserActions(data) {
  const section = document.querySelector('#users');
  section.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-user]');
    if (!button) return;
    const row = button.closest('tr');
    const profile = data.profiles.find(({ id }) => id === row.dataset.profileId);
    const warning = `Permanently delete ${displayName(profile)} (${profile.email || 'email unavailable'})?\n\nThis removes the Auth account and related profile, role, articles, comments and assessment results according to database cascade relationships. This cannot be undone.`;
    if (!window.confirm(warning)) return;
    button.disabled = true;
    try {
      await deleteUserAsAdmin(profile.id);
      await loadAdmin('User account and related data deleted successfully.');
    } catch (error) {
      console.error('Secure user deletion failed.', error);
      button.disabled = false;
      feedback(error.message || 'The user account could not be deleted.', 'danger');
    }
  });
}

function initializeArticleActions() {
  document.querySelector('#articles').addEventListener('click', async (event) => {
    const row = event.target.closest('tr[data-article-id]');
    if (!row) return;
    const toggle = event.target.closest('[data-toggle-published]');
    if (toggle) {
      const currentlyPublished = toggle.dataset.published === 'true';
      if (!window.confirm(`${currentlyPublished ? 'Unpublish' : 'Publish'} this article?`)) return;
      toggle.disabled = true;
      try {
        await setArticlePublishedAsAdmin(row.dataset.articleId, !currentlyPublished);
        await loadAdmin(`Article ${currentlyPublished ? 'unpublished' : 'published'} successfully.`);
      } catch (error) {
        console.error('Article visibility update failed.', error);
        toggle.disabled = false;
        feedback(error.message || 'Article visibility could not be changed.', 'danger');
      }
      return;
    }
    const button = event.target.closest('[data-delete-article]');
    if (!button || !window.confirm('Delete this article and all of its comments? This cannot be undone.')) return;
    button.disabled = true;
    try {
      await deleteArticleAsAdmin(row.dataset.articleId);
      await loadAdmin('Article deleted successfully.');
    } catch (error) {
      console.error('Article deletion failed.', error);
      button.disabled = false;
      feedback(error.message || 'The article could not be deleted.', 'danger');
    }
  });
}

function initializeCommentActions(data) {
  const element = document.querySelector('#comment-modal');
  const modal = new Modal(element);
  const form = document.querySelector('#admin-comment-form');
  const section = document.querySelector('#comments');
  section.addEventListener('click', async (event) => {
    const row = event.target.closest('tr[data-comment-id]');
    if (!row) return;
    const comment = data.comments.find(({ id }) => id === row.dataset.commentId);
    if (event.target.closest('[data-edit-comment]')) {
      form.elements.commentId.value = comment.id;
      form.elements.content.value = comment.content;
      modal.show();
      return;
    }
    const button = event.target.closest('[data-delete-comment]');
    if (!button || !window.confirm('Delete this comment? This cannot be undone.')) return;
    button.disabled = true;
    try {
      await deleteCommentAsAdmin(comment.id);
      await loadAdmin('Comment deleted successfully.');
    } catch (error) {
      console.error('Comment deletion failed.', error);
      button.disabled = false;
      feedback(error.message || 'The comment could not be deleted.', 'danger');
    }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const content = form.elements.content.value.trim();
    if (!content) return;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      await updateCommentAsAdmin(form.elements.commentId.value, content);
      modal.hide();
      await loadAdmin('Comment updated successfully.');
    } catch (error) {
      console.error('Comment update failed.', error);
      button.disabled = false;
      feedback(error.message || 'The comment could not be updated.', 'danger');
    }
  });
}

function initializeBranding() {
  const form = document.querySelector('#branding-form');
  const input = document.querySelector('#brand-logo-file');
  const previewWrap = document.querySelector('#brand-logo-preview-wrap');
  const preview = document.querySelector('#brand-logo-preview');
  const status = document.querySelector('#brand-logo-feedback');
  const submit = form?.querySelector('[type="submit"]');
  if (!form || !input || !previewWrap || !preview || !status || !submit) return;
  let previewUrl;
  const setStatus = (message, type = 'danger') => {
    status.textContent = message;
    status.className = `small mt-3 mb-0 text-${type}`;
  };
  input.addEventListener('change', () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const file = input.files[0];
    submit.disabled = true;
    previewWrap.classList.add('d-none');
    status.textContent = '';
    try {
      validateBrandLogo(file);
      previewUrl = URL.createObjectURL(file);
      preview.src = previewUrl;
      previewWrap.classList.remove('d-none');
      submit.disabled = false;
    } catch (error) {
      if (file) input.value = '';
      setStatus(error.message);
    }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submit.disabled = true;
    input.disabled = true;
    submit.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Saving...';
    setStatus('Uploading and verifying the new logo...', 'body-secondary');
    try {
      const result = await uploadBrandLogo(input.files[0]);
      await initializeBrandLogos(document, { refresh: true });
      form.reset();
      previewWrap.classList.add('d-none');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = undefined;
      setStatus(result.cleanupWarning ? 'Logo saved. The previous file could not be cleaned up automatically.' : 'Logo saved and applied across the site.', result.cleanupWarning ? 'warning' : 'success');
      feedback('Brand logo updated successfully.');
    } catch (error) {
      console.error('Brand logo update failed.', error);
      setStatus(error.message || 'The logo could not be saved.');
    } finally {
      input.disabled = false;
      submit.disabled = !input.files.length;
      submit.innerHTML = '<i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>Save logo';
    }
  });
}

function feedback(message, type = 'success') {
  const element = document.querySelector('#admin-feedback');
  if (!element) return;
  element.textContent = message;
  element.className = `alert alert-${type}`;
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function fullName(profile) {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed profile';
}

function displayName(profile) {
  return profile?.nickname || fullName(profile || {});
}

function date(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}
