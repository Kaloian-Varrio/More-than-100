import { supabase } from './supabase-client.js';
import { getCurrentUser } from './auth-service.js';

export const articleImageRules = { maxBytes: 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] };

export function validateArticleImage(file) {
  if (!file) return null;
  if (!articleImageRules.allowedTypes.includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP image.');
  if (file.size > articleImageRules.maxBytes) throw new Error('Choose an image no larger than 1 MB.');
  if (file.size === 0) throw new Error('The selected image is empty.');
  return file;
}

export async function uploadArticleImage(file, slugHint = 'article') {
  validateArticleImage(file);
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to upload article images.');
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const safeSlug = slugHint.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'article';
  const path = `${user.id}/${safeSlug}/cover-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from('article-images').upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false });
  if (error) throw error;
  return { path, publicUrl: supabase.storage.from('article-images').getPublicUrl(path).data.publicUrl };
}

export async function removeArticleImage(imageUrl) {
  const path = getArticleImagePath(imageUrl);
  if (!path) return false;
  const { data, error } = await supabase.storage.from('article-images').remove([path]);
  if (error) throw error;
  return data.length > 0;
}

export function getArticleImagePath(value) {
  if (!value) return null;
  try {
    const marker = '/storage/v1/object/public/article-images/';
    const pathname = new URL(value).pathname;
    const index = pathname.indexOf(marker);
    return index < 0 ? null : decodeURIComponent(pathname.slice(index + marker.length));
  } catch { return null; }
}
