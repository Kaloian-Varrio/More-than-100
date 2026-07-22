import { escapeHtml, safeImageUrl } from '../utils/html.js';

export function createProfileAvatar(profile, user, className = 'profile-avatar') {
  const imageUrl = safeImageUrl(profile?.avatar_url);
  const initials = getInitials(profile, user);
  if (!imageUrl) return `<span class="${className} profile-avatar--fallback" data-avatar-fallback aria-label="Profile avatar">${escapeHtml(initials)}</span>`;
  return `<span class="${className}"><img src="${escapeHtml(imageUrl)}" alt="Profile avatar" data-profile-avatar-image><span class="profile-avatar__initials" aria-hidden="true">${escapeHtml(initials)}</span></span>`;
}

export function initializeProfileAvatars(root = document) {
  root.querySelectorAll('[data-profile-avatar-image]').forEach((image) => {
    const fallback = () => image.parentElement?.classList.add('profile-avatar--broken');
    image.addEventListener('error', fallback);
    if (image.complete && image.naturalWidth === 0) fallback();
  });
}

function getInitials(profile, user) {
  const parts = [profile?.first_name, profile?.last_name].filter(Boolean);
  if (!parts.length && profile?.nickname) parts.push(profile.nickname);
  if (!parts.length && user?.email) parts.push(user.email.split('@')[0]);
  return parts.map((part) => part.trim().charAt(0)).join('').slice(0, 2).toUpperCase() || 'U';
}
