export function buildArticleImagePrompt({ title, shortDescription, category, content }) {
  const excerpt = content.trim().replace(/\s+/g, ' ').slice(0, 350);
  return `Photorealistic high-quality editorial photography for a healthy-living article titled "${title.trim()}". Topic: ${category || 'wellbeing'}. ${shortDescription.trim()} ${excerpt} Natural light, authentic healthy and energetic atmosphere, tasteful realistic people or relevant nature/activity/food details where appropriate, strong subject focus, clean 16:9 article-cover composition. No text, typography, logos, watermarks, or unrealistic anatomy.`.replace(/\s+/g, ' ').trim();
}
