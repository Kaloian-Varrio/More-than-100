export class ProviderNotConfiguredError extends Error {}
export class ProviderGenerationError extends Error {}

export type GeneratedImage = {
  base64: string;
  mimeType: 'image/webp';
  extension: 'webp';
};

export async function generateImage(prompt: string): Promise<GeneratedImage> {
  const apiKey = Deno.env.get('AI_IMAGE_PROVIDER_API_KEY');
  if (!apiKey) throw new ProviderNotConfiguredError('AI image generation is not configured in this environment.');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('AI_IMAGE_MODEL') || 'gpt-image-1',
      prompt,
      n: 1,
      size: '1536x1024',
      quality: 'low',
      output_format: 'webp',
      output_compression: 60,
    }),
  });

  if (!response.ok) throw new ProviderGenerationError('The image provider could not complete this request.');
  const result = await response.json();
  const base64 = result?.data?.[0]?.b64_json;
  if (typeof base64 !== 'string' || !base64) throw new ProviderGenerationError('The image provider returned no image.');
  return { base64, mimeType: 'image/webp', extension: 'webp' };
}
