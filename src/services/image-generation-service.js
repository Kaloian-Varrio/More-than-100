import { supabase } from './supabase-client.js';

export class ImageGenerationUnavailableError extends Error {}

export async function generateCoverImage({ contentType, articleId, context }) {
  const { data, error } = await supabase.functions.invoke('generate-cover-image', {
    body: {
      contentType,
      ...(articleId ? { articleId } : {}),
      context,
    },
  });
  if (error) {
    let response = {};
    try { response = await error.context?.json(); } catch { /* Use safe fallback below. */ }
    if (response.code === 'provider_not_configured' || error.context?.status === 503) {
      throw new ImageGenerationUnavailableError(response.error || 'AI image generation is not configured in this environment.');
    }
    throw new Error(response.error || 'Image generation could not be completed.');
  }
  if (!data?.base64) throw new Error('Image generation returned no image.');
  const mimeType = data.mimeType === 'image/webp' ? data.mimeType : 'image/webp';
  return new File([base64ToBytes(data.base64)], `generated-cover-${Date.now()}.webp`, { type: mimeType });
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
