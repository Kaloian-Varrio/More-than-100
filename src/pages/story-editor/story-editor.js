import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './story-editor.css';
import { renderLayout } from '../../components/layout.js';
import { requireAdminUser } from '../../services/role-service.js';
import { createStory, getStoryBySlug, updateStory } from '../../services/story-service.js';
import { uploadArticleImage, validateArticleImage } from '../../services/article-media-service.js';
import { generateCoverImage, ImageGenerationUnavailableError } from '../../services/image-generation-service.js';
import { escapeHtml } from '../../utils/html.js';

let selectedImageFile = null;
let selectedPreviewUrl = null;
let pendingGeneratedFile = null;
let pendingPreviewUrl = null;
let generationBusy = false;

const segments = location.pathname.split('/').filter(Boolean);
const isEdit = segments.at(-1) === 'edit';
const slug = isEdit ? decodeURIComponent(segments.at(-2)) : '';
document.querySelector('#app').innerHTML = '<main class="d-grid min-vh-100" style="place-items:center"><span class="spinner-border text-success" aria-label="Loading"></span></main>';
const admin = await requireAdminUser();
if (admin) initialize();

async function initialize() {
  try {
    const story = isEdit ? await getStoryBySlug(slug) : null;
    if (isEdit && !story) throw new Error('Story not found.');
    render(story);
  } catch (error) {
    renderLayout({ activePath: '/admin', content: `<section class="container py-5"><div class="alert alert-danger">${escapeHtml(error.message)}</div><a href="/admin#stories">Back to Admin</a></section>` });
  }
}

function render(story) {
  renderLayout({
    activePath: '/admin',
    mainClass: 'bg-body-tertiary',
    content: `<section class="container py-5"><div class="story-editor mx-auto">
      <a class="text-decoration-none" href="/admin#stories"><i class="bi bi-arrow-left me-1"></i>Back to Admin</a>
      <div class="card border-0 shadow-sm mt-3"><div class="card-body p-4 p-lg-5">
        <h1 class="h2 mb-4">${story ? 'Edit story' : 'Create story'}</h1>
        <div class="alert d-none" id="story-feedback" role="alert"></div>
        <form id="story-form"><div class="row g-4">
          <div class="col-md-8"><label class="form-label" for="story-title">Title</label><input class="form-control" id="story-title" name="title" maxlength="140" required value="${escapeHtml(story?.title || '')}"></div>
          <div class="col-md-4"><label class="form-label" for="person-name">Person name</label><input class="form-control" id="person-name" name="personName" maxlength="100" required value="${escapeHtml(story?.person_name || '')}"></div>
          <div class="col-12"><label class="form-label" for="story-intro">Short introduction</label><textarea class="form-control" id="story-intro" name="intro" rows="3" maxlength="500" required>${escapeHtml(story?.intro || '')}</textarea></div>
          <div class="col-12"><label class="form-label" for="story-content">Story content</label><textarea class="form-control" id="story-content" name="content" rows="16" required>${escapeHtml(story?.content || '')}</textarea><div class="form-text">Use blank lines for paragraphs and “## ” for section headings.</div></div>
          <div class="col-12"><label class="form-label" for="story-themes">Themes</label><input class="form-control" id="story-themes" name="themes" required value="${escapeHtml(story?.themes?.join(', ') || '')}"><div class="form-text">Comma-separated, for example: Movement, Sleep, Nature</div></div>
          <div class="col-12"><label class="form-label" for="story-image-url">Cover image URL</label><input class="form-control" id="story-image-url" name="imageUrl" type="text" value="${escapeHtml(story?.image_url || '')}"></div>
          <div class="col-12">
            <div class="d-flex flex-column flex-sm-row gap-2">
              <label class="btn btn-outline-primary mb-0" for="story-image-file"><i class="bi bi-upload me-2" aria-hidden="true"></i>Upload Image</label>
              <input class="visually-hidden" id="story-image-file" type="file" accept="image/jpeg,image/png,image/webp">
              <button class="btn btn-outline-primary" id="generate-story-image" type="button"><i class="bi bi-stars me-2" aria-hidden="true"></i>Generate with AI</button>
            </div>
            <div class="d-none flex-wrap gap-2 mt-3" id="story-generated-actions"><button class="btn btn-success btn-sm" type="button" data-accept-generated>Accept image</button><button class="btn btn-outline-primary btn-sm" type="button" data-regenerate-image>Regenerate</button><button class="btn btn-outline-secondary btn-sm" type="button" data-cancel-generated>Cancel</button></div>
            <div class="alert d-none mt-3 mb-0" id="story-media-feedback" role="status"></div>
            <div class="form-text">JPEG, PNG or WebP, up to 1 MB. AI generation is optional.</div>
          </div>
          <div class="col-12 ${story?.image_url ? '' : 'd-none'}" id="preview-wrap"><img class="story-editor__preview" id="image-preview" alt="Story cover preview" src="${escapeHtml(story?.image_url || '')}"></div>
          <div class="col-12"><div class="form-check form-switch"><input class="form-check-input" id="story-published" name="isPublished" type="checkbox"${story?.is_published ? ' checked' : ''}><label class="form-check-label" for="story-published">Published</label></div></div>
          <div class="col-12 d-flex gap-2"><button class="btn btn-primary" type="submit">${story ? 'Save changes' : 'Create story'}</button><a class="btn btn-outline-secondary" href="/admin#stories">Cancel</a></div>
        </div></form>
      </div></div>
    </div></section>`,
  });
  const form = document.querySelector('#story-form');
  initializeManualUpload();
  initializeGenerationControls(form, story);
  form.addEventListener('submit', (event) => submitForm(event, story));
}

function initializeManualUpload() {
  const input = document.querySelector('#story-image-file');
  input.addEventListener('change', () => {
    try {
      const file = validateArticleImage(input.files[0]);
      if (!file) return;
      clearPendingGeneration();
      setSelectedImage(file);
      setMediaFeedback('Image selected. It will upload when you save the Story.', 'success');
    } catch (error) {
      input.value = '';
      setMediaFeedback(error.message, 'danger');
    }
  });
}

function initializeGenerationControls(form, story) {
  const button = document.querySelector('#generate-story-image');
  const actions = document.querySelector('#story-generated-actions');
  const generate = async () => {
    if (generationBusy) return;
    if (!form.elements.title.value.trim()) {
      setMediaFeedback('Add a Story title before generating an image.', 'warning');
      return;
    }
    generationBusy = true;
    button.disabled = true;
    setGenerationActionsDisabled(true);
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Generating your image...';
    try {
      const file = await generateCoverImage({
        contentType: 'story',
        context: {
          title: form.elements.title.value,
          personName: form.elements.personName.value,
          intro: form.elements.intro.value,
          themes: form.elements.themes.value,
          summary: form.elements.content.value.slice(0, 500),
        },
      });
      validateArticleImage(file);
      clearPendingGeneration();
      pendingGeneratedFile = file;
      pendingPreviewUrl = URL.createObjectURL(file);
      showPreview(pendingPreviewUrl);
      actions.className = 'd-flex flex-wrap gap-2 mt-3';
      setMediaFeedback('Generated image preview. Accept it to use this cover, regenerate, or cancel.', 'success');
    } catch (error) {
      setMediaFeedback(error instanceof ImageGenerationUnavailableError ? error.message : 'AI image generation failed. You can still upload an image manually.', 'warning');
    } finally {
      generationBusy = false;
      button.disabled = false;
      setGenerationActionsDisabled(false);
      button.innerHTML = '<i class="bi bi-stars me-2" aria-hidden="true"></i>Generate with AI';
    }
  };
  button.addEventListener('click', generate);
  actions.querySelector('[data-regenerate-image]').addEventListener('click', generate);
  actions.querySelector('[data-accept-generated]').addEventListener('click', () => {
    if (!pendingGeneratedFile) return;
    if ((selectedImageFile || form.elements.imageUrl.value.trim()) && !window.confirm('Use this generated image as the Story cover? The current selection will be replaced when you save.')) return;
    const file = pendingGeneratedFile;
    pendingGeneratedFile = null;
    clearPendingPreviewUrl();
    actions.className = 'd-none flex-wrap gap-2 mt-3';
    setSelectedImage(file);
    setMediaFeedback('Generated image accepted. It will upload when you save the Story.', 'success');
  });
  actions.querySelector('[data-cancel-generated]').addEventListener('click', () => {
    clearPendingGeneration();
    showPreview(selectedPreviewUrl || story?.image_url || form.elements.imageUrl.value);
    setMediaFeedback('Generated preview cancelled. Your current cover is unchanged.', 'secondary');
  });
}

async function submitForm(event, story) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const values = Object.fromEntries(new FormData(form));
    values.isPublished = form.elements.isPublished.checked;
    if (selectedImageFile) values.imageUrl = (await uploadArticleImage(selectedImageFile, values.title)).publicUrl;
    const saved = story ? await updateStory(story.id, values) : await createStory(values);
    location.assign(`/stories/${encodeURIComponent(saved.slug)}`);
  } catch (error) {
    console.error('Story save failed.', error);
    const feedback = document.querySelector('#story-feedback');
    feedback.textContent = error.message || 'The story could not be saved.';
    feedback.className = 'alert alert-danger';
    button.disabled = false;
  }
}

function setSelectedImage(file) {
  selectedImageFile = file;
  if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
  selectedPreviewUrl = URL.createObjectURL(file);
  showPreview(selectedPreviewUrl);
}

function clearPendingGeneration() {
  pendingGeneratedFile = null;
  clearPendingPreviewUrl();
  const actions = document.querySelector('#story-generated-actions');
  if (actions) actions.className = 'd-none flex-wrap gap-2 mt-3';
}

function clearPendingPreviewUrl() {
  if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
  pendingPreviewUrl = null;
}

function setGenerationActionsDisabled(disabled) {
  document.querySelectorAll('#story-generated-actions button').forEach((button) => { button.disabled = disabled; });
}

function showPreview(url) {
  const wrap = document.querySelector('#preview-wrap');
  const preview = document.querySelector('#image-preview');
  if (!url) {
    wrap.classList.add('d-none');
    preview.removeAttribute('src');
    return;
  }
  preview.src = url;
  wrap.classList.remove('d-none');
}

function setMediaFeedback(message, type) {
  const feedback = document.querySelector('#story-media-feedback');
  feedback.textContent = message;
  feedback.className = `alert alert-${type} mt-3 mb-0`;
}
