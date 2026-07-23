import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './admin.css';
import { Modal } from 'bootstrap';
import { renderLayout } from '../../components/layout.js';
import { createProfileAvatar, initializeProfileAvatars } from '../../components/profile-avatar.js';
import { requireAdminUser } from '../../services/role-service.js';
import { deleteArticleAsAdmin, deleteCommentAsAdmin, getAdminOverviewData, updateProfileAsAdmin } from '../../services/admin-service.js';
import { escapeHtml } from '../../utils/html.js';
import { createArticleImage, initializeArticleImages } from '../../components/article-card.js';
import { initializeBrandLogos, uploadBrandLogo, validateBrandLogo } from '../../services/brand-logo-service.js';

document.querySelector('#app').innerHTML = '<main class="d-grid min-vh-100" style="place-items:center"><span class="spinner-border text-success" aria-label="Loading admin panel"></span></main>';
const user = await requireAdminUser();
if (user) loadAdmin();

async function loadAdmin() {
  try {
    const data = await getAdminOverviewData();
    renderAdmin(data);
  } catch (error) {
    console.error('Admin data could not be loaded.', error);
    renderLayout({ activePath: '/admin', mainClass: 'admin-page', content: '<section class="container py-5 text-center"><h1 class="h2">Admin Panel unavailable</h1><p class="text-body-secondary">Management data could not be loaded. Please refresh and try again.</p></section>' });
  }
}

function renderAdmin(data) {
  renderLayout({ activePath: '/admin', mainClass: 'admin-page', content: `<section class="admin-hero py-5"><div class="container"><p class="text-uppercase small fw-bold mb-2">Administration</p><h1 class="display-6 fw-bold mb-2">Admin Panel</h1><p class="mb-0 opacity-75">Manage community content, profiles and site branding.</p></div></section><div class="container py-5"><div class="alert d-none" id="admin-feedback" role="status"></div><section class="row g-3 mb-5" aria-label="Overview">${stat('people', 'Profiles', data.profiles.length)}${stat('journal-text', 'Articles', data.articles.length)}${stat('chat-square-text', 'Comments', data.comments.length)}</section><nav class="nav nav-pills gap-2 mb-4" aria-label="Admin sections"><a class="nav-link active" href="#profiles">Profiles</a><a class="nav-link" href="#articles">Articles</a><a class="nav-link" href="#comments">Comments</a><a class="nav-link" href="#branding">Branding</a></nav>${profilesSection(data.profiles)}${articlesSection(data.articles)}${commentsSection(data.comments)}${brandingSection()}</div>${profileModal()}` });
  initializeProfileAvatars(document.querySelector('#profiles'));
  initializeArticleImages(document.querySelector('#articles'));
  initializeActions(data);
  initializeBranding();
}

function stat(icon, label, value) { return `<div class="col-12 col-sm-4"><article class="card admin-stat h-100"><div class="card-body d-flex align-items-center gap-3"><span class="admin-stat__icon"><i class="bi bi-${icon}"></i></span><div><strong class="h3 d-block mb-0">${value}</strong><span class="text-body-secondary">${label}</span></div></div></article></div>`; }
function profilesSection(profiles) { return panel('profiles', 'Profiles', profiles.length ? `<div class="table-responsive"><table class="table table-hover align-middle admin-table mb-0"><thead><tr><th>Profile</th><th>Nickname</th><th>Role</th><th>Bio</th><th class="text-end">Action</th></tr></thead><tbody>${profiles.map((profile) => `<tr data-profile-id="${profile.id}"><td><div class="d-flex align-items-center gap-2">${createProfileAvatar(profile, null, 'admin-avatar')}<span>${escapeHtml(fullName(profile))}</span></div></td><td>${escapeHtml(profile.nickname || '—')}</td><td><span class="badge text-bg-${profile.role === 'admin' ? 'success' : 'secondary'}">${escapeHtml(profile.role)}</span></td><td class="text-truncate" style="max-width:16rem">${escapeHtml(profile.bio || '—')}</td><td class="text-end"><button class="btn btn-sm btn-outline-primary" data-edit-profile>Edit</button></td></tr>`).join('')}</tbody></table></div>` : empty('No profiles found.')); }
function articlesSection(articles) { return panel('articles', 'Articles', articles.length ? `<div class="table-responsive"><table class="table table-hover align-middle admin-table mb-0"><thead><tr><th>Article</th><th>Author</th><th>Category</th><th>Created</th><th class="text-end">Actions</th></tr></thead><tbody>${articles.map((article) => `<tr data-article-id="${article.id}"><td><div class="d-flex align-items-center gap-3"><div class="admin-article-thumb">${createArticleImage(article, { className: 'admin-article-thumb__image' })}</div><span class="fw-semibold">${escapeHtml(article.title)}</span></div></td><td>${escapeHtml(displayName(article.author))}</td><td>${escapeHtml(article.category?.name || '—')}</td><td>${date(article.created_at)}</td><td><div class="d-flex justify-content-end gap-2"><a class="btn btn-sm btn-outline-primary" href="/articles/${encodeURIComponent(article.slug)}">View</a><a class="btn btn-sm btn-outline-secondary" href="/articles/${encodeURIComponent(article.slug)}/edit">Edit</a><button class="btn btn-sm btn-outline-danger" data-delete-article>Delete</button></div></td></tr>`).join('')}</tbody></table></div>` : empty('No articles found.')); }
function commentsSection(comments) { return panel('comments', 'Comments', comments.length ? `<div class="table-responsive"><table class="table table-hover align-middle admin-table mb-0"><thead><tr><th>Author</th><th>Article</th><th>Comment</th><th>Created</th><th class="text-end">Action</th></tr></thead><tbody>${comments.map((comment) => `<tr data-comment-id="${comment.id}"><td>${escapeHtml(displayName(comment.author))}</td><td>${escapeHtml(comment.article?.title || 'Deleted article')}</td><td class="admin-comment">${escapeHtml(comment.content.length > 140 ? `${comment.content.slice(0, 140)}…` : comment.content)}</td><td>${date(comment.created_at)}</td><td class="text-end"><button class="btn btn-sm btn-outline-danger" data-delete-comment>Delete</button></td></tr>`).join('')}</tbody></table></div>` : empty('No comments found.')); }
function panel(id, title, body) { return `<section class="card admin-panel admin-section mb-4" id="${id}"><div class="card-body p-0"><h2 class="h4 p-4 mb-0 border-bottom">${title}</h2>${body}</div></section>`; }
function brandingSection() {
  return `
    <section class="card admin-panel admin-section mb-4" id="branding">
      <div class="card-body p-4 p-lg-5">
        <div class="row g-4 g-lg-5 align-items-start">
          <div class="col-lg-5">
            <p class="text-uppercase small fw-bold text-success mb-2">Site settings</p>
            <h2 class="h4 mb-2">Brand logo</h2>
            <p class="text-body-secondary mb-4">This logo appears throughout the public site. If no custom image is available, the original 100+ mark remains visible.</p>
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
              <div class="form-text" id="brand-logo-help">PNG, JPEG or WebP, up to 1 MB. Transparent PNG or WebP works best.</div>
              <div class="admin-logo-preview mt-3 d-none" id="brand-logo-preview-wrap">
                <img id="brand-logo-preview" alt="Selected logo preview">
              </div>
              <p class="small mt-3 mb-0" id="brand-logo-feedback" role="status" aria-live="polite"></p>
              <button class="btn btn-primary mt-3" type="submit" disabled>
                <i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>Save logo
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>`;
}
function empty(message) { return `<div class="text-center text-body-secondary p-5"><i class="bi bi-inbox d-block h2"></i>${message}</div>`; }
function profileModal() { return `<div class="modal fade" id="profile-modal" tabindex="-1" aria-labelledby="profile-modal-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><form id="admin-profile-form"><div class="modal-header"><h2 class="modal-title h5" id="profile-modal-title">Edit profile</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><input name="profileId" type="hidden"><div class="row g-3"><div class="col-sm-6"><label class="form-label" for="admin-first-name">First name</label><input class="form-control" id="admin-first-name" name="firstName" required maxlength="80"></div><div class="col-sm-6"><label class="form-label" for="admin-last-name">Last name</label><input class="form-control" id="admin-last-name" name="lastName" required maxlength="80"></div><div class="col-12"><label class="form-label" for="admin-nickname">Nickname</label><input class="form-control" id="admin-nickname" name="nickname" required maxlength="40"></div><div class="col-12"><label class="form-label" for="admin-bio">Bio</label><textarea class="form-control" id="admin-bio" name="bio" rows="4" maxlength="600"></textarea></div></div></div><div class="modal-footer admin-modal-actions"><button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" type="submit">Save changes</button></div></form></div></div></div>`; }

function initializeActions(data) {
  const modalElement = document.querySelector('#profile-modal'); const modal = new Modal(modalElement); const form = document.querySelector('#admin-profile-form');
  document.querySelector('#profiles').addEventListener('click', (event) => { const button = event.target.closest('[data-edit-profile]'); if (!button) return; const profile = data.profiles.find(({ id }) => id === button.closest('tr').dataset.profileId); form.elements.profileId.value = profile.id; form.elements.firstName.value = profile.first_name || ''; form.elements.lastName.value = profile.last_name || ''; form.elements.nickname.value = profile.nickname || ''; form.elements.bio.value = profile.bio || ''; modal.show(); });
  form.addEventListener('submit', async (event) => { event.preventDefault(); const button = form.querySelector('[type="submit"]'); button.disabled = true; try { const values = Object.fromEntries(new FormData(form)); await updateProfileAsAdmin(values.profileId, values); modal.hide(); feedback('Profile updated successfully.'); await loadAdmin(); } catch (error) { console.error('Admin profile update failed.', error); feedback('The profile could not be updated.', 'danger'); button.disabled = false; } });
  document.querySelector('#articles').addEventListener('click', (event) => handleDelete(event, '[data-delete-article]', 'Delete this article and all of its comments?', deleteArticleAsAdmin, 'articleId', 'Article deleted.'));
  document.querySelector('#comments').addEventListener('click', (event) => handleDelete(event, '[data-delete-comment]', 'Delete this comment?', deleteCommentAsAdmin, 'commentId', 'Comment deleted.'));
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
async function handleDelete(event, selector, question, action, datasetKey, success) { const button = event.target.closest(selector); if (!button || !window.confirm(question)) return; button.disabled = true; const row = button.closest('tr'); try { await action(row.dataset[datasetKey]); row.remove(); feedback(success); } catch (error) { console.error('Admin deletion failed.', error); button.disabled = false; feedback('The item could not be deleted.', 'danger'); } }
function feedback(message, type = 'success') { const element = document.querySelector('#admin-feedback'); element.textContent = message; element.className = `alert alert-${type}`; element.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
function fullName(profile) { return [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed profile'; }
function displayName(profile) { return profile?.nickname || fullName(profile || {}); }
function date(value) { return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)); }
