import { supabase } from './supabase-client.js';

const BUCKET = 'site-assets';
const FOLDER = 'branding';
const FILE_PREFIX = 'logo-';

export const brandLogoRules = {
  maxBytes: 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

let activeLogoPromise;

export function validateBrandLogo(file) {
  if (!file) throw new Error('Choose a logo image first.');
  if (!brandLogoRules.allowedTypes.includes(file.type)) {
    throw new Error('Choose a PNG, JPEG or WebP image.');
  }
  if (file.size > brandLogoRules.maxBytes) {
    throw new Error('Choose an image no larger than 1 MB.');
  }
  if (file.size === 0) throw new Error('The selected image is empty.');
  return file;
}

async function listBrandLogos() {
  const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) throw error;
  return (data || []).filter(({ name }) => name.startsWith(FILE_PREFIX));
}

export async function getActiveBrandLogo({ refresh = false } = {}) {
  if (refresh || !activeLogoPromise) {
    activeLogoPromise = listBrandLogos()
      .then(([file]) => file ? {
        name: file.name,
        path: `${FOLDER}/${file.name}`,
        publicUrl: supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${file.name}`).data.publicUrl,
      } : null)
      .catch((error) => {
        activeLogoPromise = undefined;
        throw error;
      });
  }
  return activeLogoPromise;
}

export async function uploadBrandLogo(file) {
  validateBrandLogo(file);
  const previousLogo = await getActiveBrandLogo({ refresh: true });
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const path = `${FOLDER}/${FILE_PREFIX}${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const uploadedLogo = await getActiveBrandLogo({ refresh: true });
  if (!uploadedLogo || uploadedLogo.path !== path) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error('The uploaded logo could not be verified.');
  }

  let cleanupWarning = false;
  if (previousLogo && previousLogo.path !== path) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([previousLogo.path]);
    cleanupWarning = Boolean(removeError);
  }
  return { ...uploadedLogo, cleanupWarning };
}

function showFallback(image) {
  image.hidden = true;
  image.removeAttribute('src');
  const identity = image.closest('[data-brand-identity]');
  identity?.querySelector('[data-brand-fallback]')?.removeAttribute('hidden');
  identity?.querySelector('[data-brand-label]')?.removeAttribute('hidden');
}

export async function initializeBrandLogos(root = document, { refresh = false } = {}) {
  const images = [...root.querySelectorAll('[data-brand-logo]')];
  if (!images.length) return;

  let logo;
  try {
    logo = await getActiveBrandLogo({ refresh });
  } catch (error) {
    console.warn('The custom brand logo could not be loaded.', error);
  }

  images.forEach((image) => {
    if (!logo) {
      showFallback(image);
      return;
    }
    image.onload = () => {
      image.hidden = false;
      const identity = image.closest('[data-brand-identity]');
      identity?.querySelector('[data-brand-fallback]')?.setAttribute('hidden', '');
      identity?.querySelector('[data-brand-label]')?.setAttribute('hidden', '');
    };
    image.onerror = () => showFallback(image);
    image.src = logo.publicUrl;
  });
}
