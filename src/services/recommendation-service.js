import { getAllArticles } from './article-service.js';
import { getCategories } from './category-service.js';
import { recommendArticles } from '../pages/assessment/recommendation-engine.js';

export async function getAssessmentRecommendations(scores, limit = 5) {
  const [articles, categories] = await Promise.all([getAllArticles(), getCategories()]);
  return recommendArticles(scores, articles, categories, limit);
}
