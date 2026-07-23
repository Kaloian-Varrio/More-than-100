export type ImageContentType = 'article' | 'story';

type ImageContext = Record<string, unknown>;

const limits = {
  title: 180,
  description: 420,
  category: 100,
  topic: 300,
  personName: 100,
  intro: 500,
  themes: 240,
  summary: 500,
};

function clean(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function validateContext(contentType: ImageContentType, context: unknown) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) throw new Error('Image context is required.');
  const values = context as ImageContext;
  const title = clean(values.title, limits.title);
  if (title.length < 3) throw new Error('A title of at least 3 characters is required.');

  if (contentType === 'article') {
    return {
      title,
      description: clean(values.description, limits.description),
      category: clean(values.category, limits.category),
      topic: clean(values.topic, limits.topic),
    };
  }

  return {
    title,
    personName: clean(values.personName, limits.personName),
    intro: clean(values.intro, limits.intro),
    themes: clean(values.themes, limits.themes),
    summary: clean(values.summary, limits.summary),
  };
}

export function buildCoverImagePrompt(contentType: ImageContentType, context: ReturnType<typeof validateContext>) {
  const details = contentType === 'article'
    ? `Article title: "${context.title}". Category: ${context.category || 'wellbeing'}. Description and topic: ${context.description || context.topic || 'practical healthy living'}.`
    : `Story title: "${context.title}". Person: ${context.personName || 'an active adult'}. Themes: ${context.themes || 'healthy longevity'}. Story context: ${context.intro || context.summary || 'positive everyday wellbeing'}.`;

  return [
    `Create premium photorealistic lifestyle editorial photography for a More Than 100 ${contentType} cover.`,
    details,
    'Show a healthy, positive, authentic atmosphere with natural lighting, realistic anatomy and a strong uncluttered subject.',
    'Landscape composition designed to crop cleanly to approximately 16:9.',
    'No text, typography, logos, watermarks or medical imagery unless clearly relevant to the supplied context.',
  ].join(' ');
}
