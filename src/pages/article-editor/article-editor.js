import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './article-editor.css';
import { renderLayout } from '../../components/layout.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';
import { createArticle, getArticleBySlug, getOwnedArticleBySlug, updateArticle } from '../../services/article-service.js';
import { isCurrentUserAdmin } from '../../services/role-service.js';
import { getCategories } from '../../services/category-service.js';
import { escapeHtml } from '../../utils/html.js';
import { safeImageUrl } from '../../utils/html.js';
import { removeArticleImage, uploadArticleImage, validateArticleImage } from '../../services/article-media-service.js';
import { generateArticleImage, ImageGenerationUnavailableError } from '../../services/article-image-generation-service.js';

let selectedImageFile = null;
let localPreviewUrl = null;
let generationBusy = false;

const parts = window.location.pathname.split('/').filter(Boolean);
const isEdit = parts.at(-1) === 'edit';
const slug = isEdit ? decodeURIComponent(parts.at(-2) || '') : '';

document.querySelector('#app').innerHTML = '<main class="d-grid min-vh-100" style="place-items:center"><span class="spinner-border text-success" aria-label="Loading article editor"></span></main>';
const user = await requireAuthenticatedUser();

if (user) {
  try {
    const admin = isEdit ? await isCurrentUserAdmin() : false;
    const [categories, article] = await Promise.all([
      getCategories(),
      isEdit ? (admin ? getArticleBySlug(slug) : getOwnedArticleBySlug(slug)) : Promise.resolve(null),
    ]);

    if (isEdit && !article) {
      renderLayout({ activePath: '/dashboard', mainClass: 'article-editor-page', content: notAllowedMarkup() });
    } else {
      renderEditor(categories, article);
    }
  } catch (error) {
    console.error('Article editor could not be loaded.', error);
    renderLayout({ activePath: '/dashboard', mainClass: 'article-editor-page', content: errorMarkup('The article editor could not be loaded. Please try again.') });
  }
}

function renderEditor(categories, article) {
  const action = article ? 'Save changes' : 'Publish article';
  document.title = `${article ? 'Edit Article' : 'Create Article'} | More Than 100`;
  renderLayout({
    activePath: '/dashboard',
    mainClass: 'article-editor-page',
    content: `<section class="container article-editor-shell py-5">
      <div class="mb-4"><a class="text-decoration-none fw-semibold" href="/dashboard#my-articles"><i class="bi bi-arrow-left me-2"></i>My Articles</a></div>
      <article class="card article-editor-card border-0"><div class="card-body p-4 p-md-5">
        <p class="text-success fw-bold text-uppercase small mb-2">${article ? 'Update your story' : 'Share what helps'}</p>
        <h1 class="h2 mb-2">${article ? 'Edit article' : 'Create an article'}</h1>
        <p class="text-body-secondary mb-4">${article ? 'The public article URL will remain unchanged.' : 'A unique URL will be generated automatically from your title.'}</p>
        <div class="alert d-none" id="editor-feedback" role="alert"></div>
        <form id="article-form" novalidate>
          <div class="mb-3"><label class="form-label fw-semibold" for="article-title">Title</label><input class="form-control" id="article-title" name="title" maxlength="200" required value="${escapeHtml(article?.title || '')}"><div class="invalid-feedback">Enter an article title.</div></div>
          <div class="mb-3"><label class="form-label fw-semibold" for="article-description">Short description</label><textarea class="form-control" id="article-description" name="shortDescription" maxlength="500" required>${escapeHtml(article?.short_description || '')}</textarea><div class="invalid-feedback">Enter a short description.</div></div>
          <div class="mb-3"><label class="form-label fw-semibold" for="article-category">Category</label><select class="form-select" id="article-category" name="categoryId" required><option value="">Choose a category</option>${categories.map((category) => `<option value="${escapeHtml(category.id)}"${category.id === article?.category_id ? ' selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}</select><div class="invalid-feedback">Choose a category.</div></div>
          <fieldset class="article-media p-3 p-sm-4 mb-3"><legend class="h5 px-1">Cover image</legend><div class="article-media__preview mb-3" id="article-image-preview">${createMediaPreview(article?.cover_image_url)}</div><div class="article-media__controls d-flex flex-column flex-sm-row gap-2"><label class="btn btn-outline-primary mb-0" for="article-image-file"><i class="bi bi-upload me-2" aria-hidden="true"></i>Upload Image</label><input class="visually-hidden" id="article-image-file" type="file" accept="image/jpeg,image/png,image/webp"><button class="btn btn-outline-primary" id="generate-image" type="button"><i class="bi bi-stars me-2" aria-hidden="true"></i>Generate with AI</button></div><div class="alert d-none mt-3 mb-0" id="media-feedback" role="status"></div><p class="form-text mb-0 mt-3">JPEG, PNG or WebP, up to 1 MB. Images use a responsive 16:9 cover. AI generation requires a configured secure Edge Function.</p><div class="mt-3"><label class="form-label small fw-semibold" for="article-image">Or keep/use an external image URL</label><input class="form-control" id="article-image" name="coverImageUrl" type="url" inputmode="url" placeholder="https://example.com/image.jpg" value="${escapeHtml(article?.cover_image_url || '')}"><div class="invalid-feedback">Enter a valid HTTP or HTTPS URL.</div></div></fieldset>
          <div class="mb-4"><label class="form-label fw-semibold" for="article-content">Content</label><textarea class="form-control" id="article-content" name="content" required>${escapeHtml(article?.content || '')}</textarea><div class="invalid-feedback">Enter the article content.</div></div>
          <div class="article-editor-actions d-flex flex-column flex-sm-row gap-2"><button class="btn btn-primary" id="article-submit" type="submit"><i class="bi bi-check2-circle me-2"></i>${action}</button><a class="btn btn-outline-secondary" href="/dashboard#my-articles">Cancel</a></div>
        </form>
      </div></article>
    </section>`,
  });
  document.querySelector('#article-form').addEventListener('submit', (event) => submitForm(event, article));
  initializeMediaControls();
}

async function submitForm(event, article) {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.querySelector('#editor-feedback');
  const button = document.querySelector('#article-submit');
  if (selectedImageFile) form.elements.coverImageUrl.setCustomValidity('');
  else validateCoverUrl(form.elements.coverImageUrl);
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  button.disabled = true;
  button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
  feedback.className = 'alert d-none';
  const values = Object.fromEntries(new FormData(form));
  let uploadedImage = null;
  try {
    if (selectedImageFile) {
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading image...';
      uploadedImage = await uploadArticleImage(selectedImageFile, values.title);
      values.coverImageUrl = uploadedImage.publicUrl;
    }
    const saved = article ? await updateArticle(article.id, values) : await createArticle(values);
    if (uploadedImage && article?.cover_image_url && article.cover_image_url !== uploadedImage.publicUrl) {
      removeArticleImage(article.cover_image_url).catch((cleanupError) => console.warn('Previous article image could not be removed.', cleanupError));
    }
    window.location.assign(`/articles/${encodeURIComponent(saved.slug)}`);
  } catch (error) {
    console.error('Article could not be saved.', error);
    if (uploadedImage) removeArticleImage(uploadedImage.publicUrl).catch(() => {});
    feedback.textContent = 'The article could not be saved. Check the form and try again.';
    feedback.className = 'alert alert-danger';
    button.disabled = false;
    button.innerHTML = `<i class="bi bi-check2-circle me-2"></i>${article ? 'Save changes' : 'Publish article'}`;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function initializeMediaControls() {
  const fileInput = document.querySelector('#article-image-file');
  const generateButton = document.querySelector('#generate-image');
  const urlInput = document.querySelector('#article-image');
  fileInput.addEventListener('change', () => {
    try {
      const file = validateArticleImage(fileInput.files[0]);
      if (!file) return;
      selectImageFile(file, 'Image selected. It will upload when you save the article.');
    } catch (error) {
      fileInput.value = '';
      setMediaFeedback(error.message, 'danger');
    }
  });
  urlInput.addEventListener('change', () => { if (!selectedImageFile) showMediaPreview(safeImageUrl(urlInput.value)); });
  generateButton.addEventListener('click', async () => {
    if (generationBusy) return;
    const form = document.querySelector('#article-form');
    if (!form.elements.title.value.trim()) { setMediaFeedback('Add an article title before generating an image.', 'warning'); return; }
    generationBusy = true;
    generateButton.disabled = true;
    generateButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    try {
      const file = await generateArticleImage({ title: form.elements.title.value, shortDescription: form.elements.shortDescription.value, category: form.elements.categoryId.selectedOptions[0]?.textContent || '', content: form.elements.content.value });
      validateArticleImage(file);
      selectImageFile(file, 'Generated image selected. Save the article to accept and store it.');
      generateButton.innerHTML = '<i class="bi bi-stars me-2"></i>Generate Another';
    } catch (error) {
      const message = error instanceof ImageGenerationUnavailableError ? error.message : 'AI image generation failed. You can still upload an image manually.';
      setMediaFeedback(message, 'warning');
      generateButton.innerHTML = '<i class="bi bi-stars me-2"></i>Generate with AI';
    } finally { generationBusy = false; generateButton.disabled = false; }
  });
}

function selectImageFile(file, message) {
  selectedImageFile = file;
  if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
  localPreviewUrl = URL.createObjectURL(file);
  showMediaPreview(localPreviewUrl);
  setMediaFeedback(message, 'success');
}

function createMediaPreview(value) { const url = safeImageUrl(value); return url ? `<img src="${escapeHtml(url)}" alt="Article cover preview"><span class="d-none"><i class="bi bi-image"></i></span>` : '<span class="text-center"><i class="bi bi-image d-block mb-2"></i>No cover image selected</span>'; }
function showMediaPreview(value) { const preview = document.querySelector('#article-image-preview'); const url = value?.startsWith('blob:') ? value : safeImageUrl(value); preview.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Article cover preview"><span class="d-none text-center"><i class="bi bi-image d-block mb-2"></i>Preview unavailable</span>` : '<span class="text-center"><i class="bi bi-image d-block mb-2"></i>No cover image selected</span>'; const image = preview.querySelector('img'); image?.addEventListener('error', () => { image.remove(); preview.querySelector('span')?.classList.remove('d-none'); }); }
function setMediaFeedback(message, type) { const feedback = document.querySelector('#media-feedback'); feedback.textContent = message; feedback.className = `alert alert-${type} mt-3 mb-0`; }

function validateCoverUrl(input) {
  input.setCustomValidity('');
  if (!input.value.trim()) return;
  try {
    if (!['http:', 'https:'].includes(new URL(input.value).protocol)) input.setCustomValidity('Invalid URL');
  } catch { input.setCustomValidity('Invalid URL'); }
}

function notAllowedMarkup() { return errorMarkup('This article does not exist or you do not have permission to edit it.'); }
function errorMarkup(message) { return `<section class="container py-5"><div class="content-state text-center py-5"><i class="bi bi-shield-lock d-block mb-3"></i><h1 class="h3">Article unavailable</h1><p class="text-body-secondary">${escapeHtml(message)}</p><a class="btn btn-primary" href="/dashboard#my-articles">Return to My Articles</a></div></section>`; }
