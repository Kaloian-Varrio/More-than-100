import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './search.css';
import { renderLayout } from '../../components/layout.js';
import { createProfileAvatar, initializeProfileAvatars } from '../../components/profile-avatar.js';
import { escapeHtml, safeImageUrl } from '../../utils/html.js';
import { normalizeSearchQuery, SEARCH_MIN_LENGTH, searchContent } from '../../services/search-service.js';

const query = normalizeSearchQuery(new URLSearchParams(window.location.search).get('q'));
renderLayout({
  activePath: '/search/',
  mainClass: 'search-page',
  content: createPage(query),
});

const form = document.querySelector('#search-page-form');
const input = document.querySelector('#search-page-query');
const output = document.querySelector('#search-output');

form.addEventListener('submit', (event) => {
  const nextQuery = normalizeSearchQuery(input.value);
  if (!nextQuery) {
    event.preventDefault();
    input.value = '';
    input.focus();
  } else {
    input.value = nextQuery;
  }
});

if (query) runSearch(query);

async function runSearch(searchQuery) {
  if (searchQuery.length < SEARCH_MIN_LENGTH) {
    output.innerHTML = `<div class="alert alert-info" role="status">Enter at least ${SEARCH_MIN_LENGTH} characters to search.</div>`;
    return;
  }
  output.setAttribute('aria-busy', 'true');
  output.innerHTML = '<div class="search-loading d-flex align-items-center gap-3" role="status"><span class="spinner-border text-success" aria-hidden="true"></span><span>Searching published content…</span></div>';
  try {
    const result = await searchContent(searchQuery);
    renderResults(result);
  } catch {
    output.innerHTML = '<div class="alert alert-danger" role="alert">Search could not be completed. Please try again.</div>';
  } finally {
    output.removeAttribute('aria-busy');
  }
}

function createPage(searchQuery) {
  return `<section class="search-hero py-5"><div class="container py-lg-3"><p class="section-eyebrow mb-2">Discover More Than 100</p><h1 class="display-5 fw-bold mb-4">Search</h1>
    <form class="search-page-form" id="search-page-form" action="/search/" method="get" role="search">
      <label class="form-label" for="search-page-query">Search articles, stories and topics</label>
      <div class="input-group"><input class="form-control form-control-lg" id="search-page-query" name="q" type="search" value="${escapeHtml(searchQuery)}" placeholder="Search articles, stories and topics" autocomplete="off"><button class="btn btn-primary px-4" type="submit"><i class="bi bi-search me-2" aria-hidden="true"></i>Search</button></div>
    </form></div></section>
    <section class="container py-5" id="search-output" aria-live="polite">${searchQuery ? '' : '<div class="search-prompt"><i class="bi bi-search" aria-hidden="true"></i><p class="lead mb-0">Enter a word or phrase to explore published content.</p></div>'}</section>`;
}

function renderResults({ query: searchQuery, groups, failures }) {
  const total = Object.values(groups).reduce((sum, items) => sum + items.length, 0);
  document.title = `Search: ${searchQuery} | More Than 100`;
  if (!total) {
    output.innerHTML = `<header class="mb-4"><h2 class="h3">Search results for “${escapeHtml(searchQuery)}”</h2></header><div class="alert alert-info" role="status">No results were found. Try a different word or a broader phrase.</div>`;
    return;
  }
  const partialNotice = failures.length ? '<p class="small text-body-secondary">Some result types are temporarily unavailable.</p>' : '';
  output.innerHTML = `<header class="search-summary mb-5"><h2 class="h3 mb-2">Search results for “${escapeHtml(searchQuery)}”</h2><p class="text-body-secondary mb-1">${total} result${total === 1 ? '' : 's'} found</p>${partialNotice}</header>
    ${createGroup('Articles', groups.articles, createArticleResult)}
    ${createGroup('Stories', groups.stories, createStoryResult)}
    ${createGroup('Topics', groups.topics, createTopicResult)}
    ${createGroup('Members', groups.members, createMemberResult)}`;
  initializeProfileAvatars(output);
}

function createGroup(title, items, renderer) {
  if (!items.length) return '';
  const id = `search-${title.toLowerCase()}`;
  return `<section class="search-group mb-5" aria-labelledby="${id}"><h2 class="h3 mb-4" id="${id}">${title} <span class="badge rounded-pill text-bg-light">${items.length}</span></h2><div class="row g-4">${items.map(renderer).join('')}</div></section>`;
}

function createArticleResult(article) {
  return createContentResult({
    type: 'Article', title: article.title, excerpt: article.excerpt,
    href: `/articles/${encodeURIComponent(article.slug)}`, image: article.cover_image_url,
    meta: article.category?.name || 'Wellbeing',
  });
}

function createStoryResult(story) {
  return createContentResult({
    type: 'Story', title: story.title, excerpt: story.excerpt,
    href: `/stories/${encodeURIComponent(story.slug)}`, image: story.image_url,
  });
}

function createTopicResult(topic) {
  return createContentResult({
    type: 'Topic', title: topic.name, excerpt: topic.description,
    href: `/categories/${encodeURIComponent(topic.slug)}`, meta: topic.parent_name,
    icon: 'tags',
  });
}

function createMemberResult(member) {
  if (!member.nickname) return '';
  const name = [member.first_name, member.last_name].filter(Boolean).join(' ') || member.nickname;
  return `<div class="col-12 col-md-6"><article class="search-result card h-100 border-0 p-4"><div class="d-flex gap-3">${createProfileAvatar(member, null, 'search-result__avatar')}<div><p class="search-result__type mb-1">Member</p><h3 class="h5 mb-2"><a class="stretched-link" href="/members/${encodeURIComponent(member.nickname)}">${escapeHtml(name)}</a></h3>${member.bio ? `<p class="text-body-secondary mb-0">${escapeHtml(member.bio.slice(0, 180))}</p>` : ''}</div></div></article></div>`;
}

function createContentResult({ type, title, excerpt, href, image, meta, icon = 'file-text' }) {
  const imageUrl = safeImageUrl(image);
  return `<div class="col-12 col-lg-6"><article class="search-result card h-100 border-0 overflow-hidden"><div class="row g-0 h-100"><div class="col-4 search-result__media">${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" loading="lazy">` : `<i class="bi bi-${icon}" aria-hidden="true"></i>`}</div><div class="col-8"><div class="card-body p-4"><p class="search-result__type mb-1">${escapeHtml(type)}${meta ? ` · ${escapeHtml(meta)}` : ''}</p><h3 class="h5 mb-2"><a class="stretched-link" href="${escapeHtml(href)}">${escapeHtml(title)}</a></h3>${excerpt ? `<p class="text-body-secondary mb-0">${escapeHtml(excerpt)}</p>` : ''}</div></div></div></article></div>`;
}
