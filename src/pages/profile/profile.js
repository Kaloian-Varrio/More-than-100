import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './profile.css';
import { renderLayout } from '../../components/layout.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';
import { getCurrentProfile, removeCurrentUserAvatar, updateCurrentProfile, uploadCurrentUserAvatar, validateAvatarFile } from '../../services/profile-service.js';
import { escapeHtml, safeImageUrl } from '../../utils/html.js';

document.querySelector('#app').innerHTML = '<main class="d-grid min-vh-100" style="place-items:center"><span class="spinner-border text-success" aria-label="Loading profile"></span></main>';
const user = await requireAuthenticatedUser();
if (user) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) throw new Error('Profile not found.');
    renderProfile(user, profile);
  } catch (error) {
    console.error('Profile could not be loaded.', error);
    renderLayout({ activePath: '/profile', mainClass: 'profile-page', content: '<section class="container py-5 text-center"><h1 class="h2">Profile unavailable</h1><p class="text-body-secondary">Your profile could not be loaded. Please refresh and try again.</p><a class="btn btn-primary" href="/dashboard">Back to Dashboard</a></section>' });
  }
}

function renderProfile(user, initialProfile) {
  let profile = initialProfile;
  let selectedFile = null;
  let previewObjectUrl = null;
  renderLayout({ activePath: '/profile', mainClass: 'profile-page', content: `<section class="container profile-shell py-5"><div class="mb-4"><p class="text-success fw-bold text-uppercase small mb-2">Your account</p><h1 class="display-6 fw-bold mb-2">My Profile</h1><p class="text-body-secondary mb-0">Manage the personal details shown with your More Than 100 contributions.</p></div><article class="card profile-card border-0"><div class="row g-0"><aside class="col-lg-4 profile-sidebar p-4 p-md-5 text-center"><div class="profile-avatar-preview mb-4" id="avatar-preview">${createPreview(profile, user)}</div><label class="btn btn-light w-100" for="avatar-file"><i class="bi bi-camera me-2" aria-hidden="true"></i>Choose profile image</label><input class="visually-hidden" id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp"><p class="profile-upload-note small mt-3 mb-0">JPEG, PNG or WebP. Maximum 1 MB.</p><div class="alert alert-danger d-none text-start mt-3 mb-0" id="avatar-error" role="alert"></div></aside><div class="col-lg-8 bg-white p-4 p-md-5"><div class="alert d-none" id="profile-feedback" role="alert" aria-live="polite"></div><form class="profile-form" id="profile-form" novalidate><div class="row g-3"><div class="col-md-6"><label class="form-label fw-semibold" for="first-name">First name</label><input class="form-control" id="first-name" name="firstName" maxlength="80" required value="${escapeHtml(profile.first_name || '')}"><div class="invalid-feedback">Enter your first name.</div></div><div class="col-md-6"><label class="form-label fw-semibold" for="last-name">Last name</label><input class="form-control" id="last-name" name="lastName" maxlength="80" required value="${escapeHtml(profile.last_name || '')}"><div class="invalid-feedback">Enter your last name.</div></div><div class="col-12"><label class="form-label fw-semibold" for="nickname">Nickname</label><input class="form-control" id="nickname" name="nickname" minlength="2" maxlength="40" pattern="[A-Za-z0-9][A-Za-z0-9._-]{1,39}" required value="${escapeHtml(profile.nickname || '')}"><div class="form-text">Use 2–40 letters, numbers, dots, underscores or hyphens.</div><div class="invalid-feedback">Enter a valid nickname.</div></div><div class="col-12"><label class="form-label fw-semibold" for="bio">Bio</label><textarea class="form-control" id="bio" name="bio" maxlength="600" placeholder="Share a little about your interests and healthy-living journey.">${escapeHtml(profile.bio || '')}</textarea></div>${socialField('websiteUrl', 'Website', 'bi-globe', profile.website_url)}${socialField('instagramUrl', 'Instagram', 'bi-instagram', profile.instagram_url)}${socialField('facebookUrl', 'Facebook', 'bi-facebook', profile.facebook_url)}</div><div class="profile-actions d-flex flex-column flex-sm-row gap-2 mt-4"><button class="btn btn-primary" id="profile-submit" type="submit"><i class="bi bi-check2-circle me-2" aria-hidden="true"></i>Save Profile</button><a class="btn btn-outline-secondary" href="/dashboard">Cancel</a></div></form></div></div></article></section>` });

  const fileInput = document.querySelector('#avatar-file');
  initializePreviewFallback();
  fileInput.addEventListener('change', () => {
    const error = document.querySelector('#avatar-error');
    error.classList.add('d-none');
    try {
      selectedFile = validateAvatarFile(fileInput.files[0]);
      if (!selectedFile) return;
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = URL.createObjectURL(selectedFile);
      showPreview(previewObjectUrl, user, profile);
    } catch (validationError) {
      selectedFile = null;
      fileInput.value = '';
      error.textContent = validationError.message;
      error.classList.remove('d-none');
    }
  });

  document.querySelector('#profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    validateSocialUrls(form);
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;
    const button = document.querySelector('#profile-submit');
    const feedback = document.querySelector('#profile-feedback');
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    feedback.className = 'alert d-none';
    let uploaded = null;
    try {
      if (selectedFile) uploaded = await uploadCurrentUserAvatar(selectedFile);
      const values = Object.fromEntries(new FormData(form));
      if (uploaded) values.avatarUrl = uploaded.publicUrl;
      const previousAvatar = profile.avatar_url;
      profile = await updateCurrentProfile(values);
      if (uploaded && previousAvatar && previousAvatar !== uploaded.publicUrl) {
        removeCurrentUserAvatar(previousAvatar).catch((cleanupError) => console.warn('Previous avatar could not be removed.', cleanupError));
      }
      selectedFile = null;
      fileInput.value = '';
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
      showPreview(profile.avatar_url, user, profile);
      feedback.textContent = 'Your profile has been updated successfully.';
      feedback.className = 'alert alert-success';
    } catch (saveError) {
      console.error('Profile could not be saved.', saveError);
      if (uploaded) removeCurrentUserAvatar(uploaded.publicUrl).catch(() => {});
      feedback.textContent = 'Your profile could not be saved. Check your details and try again.';
      feedback.className = 'alert alert-danger';
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="bi bi-check2-circle me-2" aria-hidden="true"></i>Save Profile';
    }
  });
}

function socialField(name, label, icon, value) { return `<div class="col-12"><label class="form-label fw-semibold" for="${name}"><i class="bi ${icon} me-2 text-success" aria-hidden="true"></i>${label}</label><input class="form-control" id="${name}" name="${name}" type="url" inputmode="url" placeholder="https://" value="${escapeHtml(value || '')}"><div class="invalid-feedback">Enter a valid HTTP or HTTPS URL.</div></div>`; }
function validateSocialUrls(form) { ['websiteUrl', 'instagramUrl', 'facebookUrl'].forEach((name) => { const input = form.elements[name]; input.setCustomValidity(''); if (!input.value.trim()) return; try { if (!['http:', 'https:'].includes(new URL(input.value).protocol)) input.setCustomValidity('Invalid URL'); } catch { input.setCustomValidity('Invalid URL'); } }); }
function createPreview(profile, user) { const url = safeImageUrl(profile.avatar_url); return url ? `<img src="${escapeHtml(url)}" alt="Profile image"><span class="profile-avatar-preview__fallback" hidden>${escapeHtml(initials(profile, user))}</span>` : `<span class="profile-avatar-preview__fallback">${escapeHtml(initials(profile, user))}</span>`; }
function showPreview(url, user, profile) { const safeUrl = url?.startsWith('blob:') ? url : safeImageUrl(url); document.querySelector('#avatar-preview').innerHTML = safeUrl ? `<img src="${escapeHtml(safeUrl)}" alt="Selected profile image"><span class="profile-avatar-preview__fallback" hidden>${escapeHtml(initials(profile, user))}</span>` : `<span class="profile-avatar-preview__fallback">${escapeHtml(initials(profile, user))}</span>`; initializePreviewFallback(); }
function initializePreviewFallback() { const image = document.querySelector('#avatar-preview img'); image?.addEventListener('error', () => { image.hidden = true; image.nextElementSibling.hidden = false; }); }
function initials(profile, user) { const values = [profile.first_name, profile.last_name].filter(Boolean); if (!values.length) values.push(profile.nickname || user.email?.split('@')[0] || 'U'); return values.map((value) => value.trim()[0]).join('').slice(0, 2).toUpperCase(); }
