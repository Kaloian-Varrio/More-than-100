import { supabase } from './supabase-client.js';
import { getCurrentUser } from './auth-service.js';

const profileFields = 'id, first_name, last_name, nickname, bio, avatar_url, website_url, instagram_url, facebook_url, created_at, updated_at';
export const avatarRules = { maxBytes: 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] };

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileFields)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCurrentProfile() {
  const user = await requireUser();
  return getProfile(user.id);
}

export async function updateCurrentProfile(values) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      nickname: values.nickname.trim(),
      bio: values.bio.trim() || null,
      website_url: values.websiteUrl.trim() || null,
      instagram_url: values.instagramUrl.trim() || null,
      facebook_url: values.facebookUrl.trim() || null,
      ...(values.avatarUrl !== undefined ? { avatar_url: values.avatarUrl || null } : {}),
    })
    .eq('id', user.id)
    .select(profileFields)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Profile update was not permitted.');
  return data;
}

export function validateAvatarFile(file) {
  if (!file) return null;
  if (!avatarRules.allowedTypes.includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP image.');
  if (file.size > avatarRules.maxBytes) throw new Error('Choose an image no larger than 1 MB.');
  if (file.size === 0) throw new Error('The selected image is empty.');
  return file;
}

export async function uploadCurrentUserAvatar(file) {
  validateAvatarFile(file);
  const user = await requireUser();
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const path = `${user.id}/avatar-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function removeCurrentUserAvatar(avatarUrl) {
  const user = await requireUser();
  const path = getOwnedAvatarPath(avatarUrl, user.id);
  if (!path) return false;
  const { error } = await supabase.storage.from('avatars').remove([path]);
  if (error) throw error;
  return true;
}

function getOwnedAvatarPath(value, userId) {
  if (!value) return null;
  try {
    const marker = '/storage/v1/object/public/avatars/';
    const url = new URL(value);
    const index = url.pathname.indexOf(marker);
    if (index < 0) return null;
    const path = decodeURIComponent(url.pathname.slice(index + marker.length));
    return path.startsWith(`${userId}/`) ? path : null;
  } catch { return null; }
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to manage your profile.');
  return user;
}
