import { maintenanceCategorySlugs, recommendationAreas } from './recommendation-config.js';

const dimensions = ['stress', 'sedentary', 'social'];

export function recommendArticles(scores, articles, categories, limit = 5) {
  const uniqueArticles = [...new Map(articles.map((article) => [article.id, article])).values()];
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const rankedDimensions = [...dimensions].sort((a, b) => scores[b].score - scores[a].score || dimensions.indexOf(a) - dimensions.indexOf(b));
  const selected = [];
  const selectedIds = new Set();
  const add = (article) => {
    if (!article || selectedIds.has(article.id) || selected.length >= limit) return;
    selected.push(article);
    selectedIds.add(article.id);
  };

  if (rankedDimensions.every((dimension) => scores[dimension].score <= 25)) {
    sortRecent(uniqueArticles.filter((article) => getCategoryPath(article.category_id, categoryMap).some((category) => maintenanceCategorySlugs.includes(category.slug)))).forEach(add);
  }

  const spread = scores[rankedDimensions[0]].score - scores[rankedDimensions[rankedDimensions.length - 1]].score;
  const topGap = scores[rankedDimensions[0]].score - scores[rankedDimensions[1]].score;
  const quotas = spread <= 5 || topGap <= 10 ? [2, 2, 1] : [3, 1, 1];
  rankedDimensions.forEach((dimension, index) => {
    uniqueArticles
      .map((article) => ({ article, relevance: getArticleDimensionMatch(article, dimension, categoryMap) }))
      .filter(({ relevance }) => relevance > 0)
      .sort((a, b) => b.relevance - a.relevance || newestFirst(a.article, b.article))
      .filter(({ article }) => !selectedIds.has(article.id))
      .slice(0, quotas[index])
      .forEach(({ article }) => add(article));
  });

  uniqueArticles
    .map((article) => ({ article, relevance: rankedDimensions.reduce((total, dimension) => total + getArticleDimensionMatch(article, dimension, categoryMap) * (scores[dimension].score + 25), 0) }))
    .sort((a, b) => b.relevance - a.relevance || newestFirst(a.article, b.article))
    .forEach(({ article }) => add(article));
  sortRecent(uniqueArticles).forEach(add);
  return selected.slice(0, limit);
}

export function getArticleDimensionMatch(article, dimension, categoryMapOrCategories) {
  const categoryMap = categoryMapOrCategories instanceof Map ? categoryMapOrCategories : new Map(categoryMapOrCategories.map((category) => [category.id, category]));
  const area = recommendationAreas[dimension];
  const categoryPath = getCategoryPath(article.category_id, categoryMap);
  const categoryScore = categoryPath.reduce((score, category, index) => score + (area.categorySlugs.includes(category.slug) ? (index === 0 ? 12 : 6) : 0), 0);
  const text = `${article.title} ${article.short_description || ''} ${article.content || ''}`.toLowerCase();
  const keywordScore = area.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 2 : 0), 0);
  return categoryScore + keywordScore;
}

function getCategoryPath(categoryId, categoryMap) {
  const path = [];
  let category = categoryMap.get(categoryId);
  while (category && path.length < 10) {
    path.push(category);
    category = category.parent_id ? categoryMap.get(category.parent_id) : null;
  }
  return path;
}

function newestFirst(a, b) { return new Date(b.created_at) - new Date(a.created_at) || a.slug.localeCompare(b.slug); }
function sortRecent(articles) { return [...articles].sort(newestFirst); }
