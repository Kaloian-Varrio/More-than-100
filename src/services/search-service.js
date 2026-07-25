import { supabase } from './supabase-client.js';
import { getCurrentUser } from './auth-service.js';

export const SEARCH_MIN_LENGTH = 2;
const RESULT_LIMIT = 10;
const memberFields = 'id, first_name, last_name, nickname, bio, avatar_url, website_url, instagram_url, facebook_url, created_at';

export function normalizeSearchQuery(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export async function searchContent(value) {
  const query = normalizeSearchQuery(value);
  if (query.length < SEARCH_MIN_LENGTH) {
    return { query, groups: emptyGroups(), membersAvailable: false, failures: [] };
  }

  const user = await getCurrentUser().catch(() => null);
  const searches = [
    ['articles', searchArticles(query)],
    ['stories', searchStories(query)],
    ['topics', searchTopics(query)],
    ...(user ? [['members', searchMembers(query)]] : []),
  ];
  const settled = await Promise.allSettled(searches.map(([, promise]) => promise));
  const groups = emptyGroups();
  const failures = [];

  settled.forEach((result, index) => {
    const name = searches[index][0];
    if (result.status === 'fulfilled') groups[name] = result.value;
    else failures.push(name);
  });

  if (failures.length === searches.length) throw new Error('All search groups failed.');
  return { query, groups, membersAvailable: Boolean(user) && !failures.includes('members'), failures };
}

async function searchArticles(query) {
  const fields = 'id, title, slug, short_description, content, cover_image_url, category:categories!articles_category_id_fkey(name, slug)';
  const rows = await searchFields('articles', ['title', 'short_description', 'content'], query, fields, (builder) => builder.eq('is_published', true));
  return rows.map((article) => ({ ...article, excerpt: article.short_description || plainExcerpt(article.content) }));
}

async function searchStories(query) {
  const fields = 'id, title, slug, intro, content, image_url';
  const rows = await searchFields('stories', ['title', 'intro', 'content'], query, fields, (builder) => builder.eq('is_published', true));
  return rows.map((story) => ({ ...story, excerpt: story.intro || plainExcerpt(story.content) }));
}

async function searchTopics(query) {
  const rows = await searchFields('categories', ['name', 'description', 'slug'], query, 'id, name, slug, parent_id, description');
  const parentIds = [...new Set(rows.map(({ parent_id: parentId }) => parentId).filter(Boolean))];
  if (!parentIds.length) return rows;
  const { data, error } = await supabase.from('categories').select('id, name').in('id', parentIds);
  if (error) return rows;
  const parentNames = new Map(data.map(({ id, name }) => [id, name]));
  return rows.map((topic) => ({ ...topic, parent_name: parentNames.get(topic.parent_id) || '' }));
}

async function searchMembers(query) {
  const rows = await searchFields('profiles', ['first_name', 'last_name', 'nickname', 'bio'], query, memberFields);
  return rows.filter(({ nickname }) => Boolean(nickname));
}

async function searchFields(table, columns, query, fields, constrain = (builder) => builder) {
  const pattern = `%${escapeLikePattern(query)}%`;
  const requests = columns.map(async (column) => {
    const { data, error } = await constrain(supabase.from(table).select(fields)).ilike(column, pattern).limit(RESULT_LIMIT);
    if (error) throw error;
    return data;
  });
  return uniqueById((await Promise.all(requests)).flat()).slice(0, RESULT_LIMIT);
}

function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, '\\$&');
}

function uniqueById(rows) {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

function plainExcerpt(value, length = 180) {
  const text = String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

function emptyGroups() {
  return { articles: [], stories: [], topics: [], members: [] };
}
