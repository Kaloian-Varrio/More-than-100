import { supabase } from './supabase-client.js';
import { buildArticleImagePrompt } from './article-image-prompt.js';
export { buildArticleImagePrompt } from './article-image-prompt.js';

export class ImageGenerationUnavailableError extends Error {}

export async function generateArticleImage(context) {
  if (import.meta.env.VITE_AI_IMAGE_GENERATION_ENABLED !== 'true') {
    throw new ImageGenerationUnavailableError('AI image generation is not configured yet. You can still upload an image manually.');
  }
  const prompt = buildArticleImagePrompt(context);
  const { data, error } = await supabase.functions.invoke('generate-article-image', { body: { prompt } });
  if (error) throw new Error('Image generation could not be completed.');
  if (data?.base64) return new File([base64ToBytes(data.base64)], `generated-${Date.now()}.${data.extension || 'webp'}`, { type: data.mimeType || 'image/webp' });
  if (data?.imageUrl) {
    const response = await fetch(data.imageUrl);
    if (!response.ok) throw new Error('Generated image could not be downloaded.');
    const blob = await response.blob();
    return new File([blob], `generated-${Date.now()}.webp`, { type: blob.type || 'image/webp' });
  }
  throw new Error('Image generation returned no image.');
}

function base64ToBytes(value) { const binary = atob(value); return Uint8Array.from(binary, (character) => character.charCodeAt(0)); }
