import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './article-editor.css';
import { renderLayout } from '../../components/layout.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';
import { createArticle, getArticleBySlug, getOwnedArticleBySlug, updateArticle } from '../../services/article-service.js';
import { isCurrentUserAdmin } from '../../services/role-service.js';
import { getCategories } from '../../services/category-service.js';
import { escapeHtml } from '../../utils/html.js';

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
          <div class="mb-3"><label class="form-label fw-semibold" for="article-image">Cover image URL</label><input class="form-control" id="article-image" name="coverImageUrl" type="url" inputmode="url" placeholder="https://example.com/image.jpg" value="${escapeHtml(article?.cover_image_url || '')}"><div class="form-text">Use a public HTTP or HTTPS image URL. Existing article image fallback handling remains active.</div><div class="invalid-feedback">Enter a valid HTTP or HTTPS URL.</div></div>
          <div class="mb-4"><label class="form-label fw-semibold" for="article-content">Content</label><textarea class="form-control" id="article-content" name="content" required>${escapeHtml(article?.content || '')}</textarea><div class="invalid-feedback">Enter the article content.</div></div>
          <div class="article-editor-actions d-flex flex-column flex-sm-row gap-2"><button class="btn btn-primary" id="article-submit" type="submit"><i class="bi bi-check2-circle me-2"></i>${action}</button><a class="btn btn-outline-secondary" href="/dashboard#my-articles">Cancel</a></div>
        </form>
      </div></article>
    </section>`,
  });
  document.querySelector('#article-form').addEventListener('submit', (event) => submitForm(event, article));
}

async function submitForm(event, article) {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.querySelector('#editor-feedback');
  const button = document.querySelector('#article-submit');
  validateCoverUrl(form.elements.coverImageUrl);
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  button.disabled = true;
  button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
  feedback.className = 'alert d-none';
  const values = Object.fromEntries(new FormData(form));
  try {
    const saved = article ? await updateArticle(article.id, values) : await createArticle(values);
    window.location.assign(`/articles/${encodeURIComponent(saved.slug)}`);
  } catch (error) {
    feedback.textContent = error.message || 'The article could not be saved.';
    feedback.className = 'alert alert-danger';
    button.disabled = false;
    button.innerHTML = `<i class="bi bi-check2-circle me-2"></i>${article ? 'Save changes' : 'Publish article'}`;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function validateCoverUrl(input) {
  input.setCustomValidity('');
  if (!input.value.trim()) return;
  try {
    if (!['http:', 'https:'].includes(new URL(input.value).protocol)) input.setCustomValidity('Invalid URL');
  } catch { input.setCustomValidity('Invalid URL'); }
}

function notAllowedMarkup() { return errorMarkup('This article does not exist or you do not have permission to edit it.'); }
function errorMarkup(message) { return `<section class="container py-5"><div class="content-state text-center py-5"><i class="bi bi-shield-lock d-block mb-3"></i><h1 class="h3">Article unavailable</h1><p class="text-body-secondary">${escapeHtml(message)}</p><a class="btn btn-primary" href="/dashboard#my-articles">Return to My Articles</a></div></section>`; }
