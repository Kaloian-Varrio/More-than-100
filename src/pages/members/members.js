import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import '../../styles/content.css';
import './members.css';
import { renderLayout } from '../../components/layout.js';
import { createProfileAvatar, initializeProfileAvatars } from '../../components/profile-avatar.js';
import { createArticleCard, initializeArticleImages } from '../../components/article-card.js';
import { createEmptyState, createErrorState, createLoadingState } from '../../components/content-state.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';
import { getMemberByNickname, getMembers } from '../../services/member-service.js';
import { getPublishedArticlesByAuthor } from '../../services/article-service.js';
import { escapeHtml, safeImageUrl } from '../../utils/html.js';

document.querySelector('#app').innerHTML = '<main class="d-grid min-vh-100" style="place-items:center"><span class="spinner-border text-success" aria-label="Loading members"></span></main>';
const user = await requireAuthenticatedUser();
if (user) {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length > 1) renderMember(decodeURIComponent(parts[1]));
  else renderDirectory();
}

async function renderDirectory() {
  renderLayout({
    activePath: '/members',
    mainClass: 'members-page',
    content: `<section class="members-hero py-5"><div class="container py-lg-4"><p class="section-eyebrow mb-2">Our community</p><h1 class="display-5 fw-bold mb-3">Meet the members</h1><p class="lead text-body-secondary mb-0">Discover people sharing practical ideas, active habits and meaningful connections.</p></div></section><section class="container py-5" aria-labelledby="members-title"><h2 class="visually-hidden" id="members-title">Member directory</h2><div class="row g-4" id="members-grid">${createLoadingState('Loading members...')}</div></section>`,
  });
  const grid = document.querySelector('#members-grid');
  try {
    const members = await getMembers();
    grid.innerHTML = members.length ? members.map(createMemberCard).join('') : createEmptyState('No members yet', 'Community profiles will appear here.');
    initializeProfileAvatars(grid);
  } catch (error) {
    console.error('Members could not be loaded.', error);
    grid.innerHTML = createErrorState('Members could not be loaded', 'Refresh the page to try again.');
  }
}

async function renderMember(nickname) {
  renderLayout({
    activePath: '/members',
    mainClass: 'member-page',
    content: `<section class="container py-5" id="member-content">${createLoadingState('Loading member profile...')}</section>`,
  });
  const container = document.querySelector('#member-content');
  try {
    const member = await getMemberByNickname(nickname);
    if (!member) {
      container.innerHTML = createEmptyState('Member not found', 'This member profile is unavailable.');
      return;
    }
    const articles = await getPublishedArticlesByAuthor(member.id);
    document.title = `${displayName(member)} | Members | More Than 100`;
    container.innerHTML = createMemberProfile(member, articles);
    initializeProfileAvatars(container);
    initializeArticleImages(container);
  } catch (error) {
    console.error('Member profile could not be loaded.', error);
    container.innerHTML = createErrorState('Member profile could not be loaded', 'Refresh the page to try again.');
  }
}

function createMemberCard(member) {
  const name = displayName(member);
  const bio = excerpt(member.bio, 150);
  const profileHref = member.nickname ? `/members/${encodeURIComponent(member.nickname)}` : '';
  return `<div class="col-12 col-md-6 col-xl-4"><article class="member-card card h-100 border-0 p-4">
    <div class="d-flex align-items-center gap-3 mb-3">${createProfileAvatar(member, null, 'member-avatar')}<div class="min-w-0"><h2 class="h5 mb-1 text-break">${escapeHtml(name)}</h2>${member.nickname ? `<p class="member-nickname mb-0">@${escapeHtml(member.nickname)}</p>` : ''}</div></div>
    ${bio ? `<p class="text-body-secondary mb-4">${escapeHtml(bio)}</p>` : '<p class="text-body-secondary mb-4">This member has not added a bio yet.</p>'}
    ${createSocialLinks(member, 'mb-4')}
    ${profileHref ? `<a class="btn btn-outline-primary mt-auto align-self-start" href="${profileHref}">View profile <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>` : '<span class="small text-body-secondary mt-auto">Profile details coming soon.</span>'}
  </article></div>`;
}

function createMemberProfile(member, articles) {
  return `<nav aria-label="Breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="/members">Members</a></li><li class="breadcrumb-item active" aria-current="page">${escapeHtml(displayName(member))}</li></ol></nav>
    <article class="member-profile card border-0 overflow-hidden mb-5"><div class="row g-0"><div class="col-lg-4 member-profile__identity p-4 p-md-5 text-center">${createProfileAvatar(member, null, 'member-profile-avatar mx-auto mb-3')}<h1 class="h2 mb-1">${escapeHtml(displayName(member))}</h1>${member.nickname ? `<p class="mb-0">@${escapeHtml(member.nickname)}</p>` : ''}</div><div class="col-lg-8 p-4 p-md-5"><p class="section-eyebrow mb-2">Member profile</p><h2 class="h3 mb-3">About</h2><p class="member-bio text-body-secondary">${member.bio ? escapeHtml(member.bio) : 'This member has not added a bio yet.'}</p>${createSocialLinks(member, 'mt-4')}</div></div></article>
    <section aria-labelledby="member-articles-title"><div class="mb-4"><p class="section-eyebrow mb-2">Shared ideas</p><h2 class="h2 mb-0" id="member-articles-title">Published articles</h2></div>${articles.length ? `<div class="row g-4">${articles.map(createArticleCard).join('')}</div>` : createEmptyState('No published articles yet', 'Published contributions from this member will appear here.')}</section>`;
}

function createSocialLinks(member, classes = '') {
  const links = [
    ['Website', 'globe2', safeImageUrl(member.website_url)],
    ['Instagram', 'instagram', safeImageUrl(member.instagram_url)],
    ['Facebook', 'facebook', safeImageUrl(member.facebook_url)],
  ].filter(([, , href]) => href);
  if (!links.length) return '';
  return `<div class="member-socials d-flex flex-wrap gap-2 ${classes}" aria-label="Member links">${links.map(([label, icon, href]) => `<a class="btn btn-sm btn-outline-secondary" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${label} for ${escapeHtml(displayName(member))} (opens in a new tab)"><i class="bi bi-${icon}" aria-hidden="true"></i><span>${label}</span></a>`).join('')}</div>`;
}

function displayName(member) {
  return [member.first_name, member.last_name].filter(Boolean).join(' ') || member.nickname || 'Community member';
}

function excerpt(value, limit) {
  const text = String(value || '').trim();
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}
