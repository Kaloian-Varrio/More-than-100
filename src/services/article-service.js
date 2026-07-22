import { supabase } from './supabase-client.js';
import { getCurrentUser } from './auth-service.js';

const articleFields = `
  id, author_id, category_id, title, slug, short_description,
  content, cover_image_url, created_at, updated_at,
  category:categories!articles_category_id_fkey(name, slug)
`;

export async function getFeaturedArticles(limit = 3) {
  const { data, error } = await supabase
    .from('articles')
    .select(articleFields)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getAllArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select(articleFields)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getArticleBySlug(slug) {
  const { data: article, error } = await supabase
    .from('articles')
    .select(articleFields)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!article) return null;

  const { data: author, error: authorError } = await supabase
    .from('profiles')
    .select('first_name, last_name, nickname')
    .eq('id', article.author_id)
    .maybeSingle();

  if (authorError) throw authorError;
  return { ...article, author };
}

export async function getArticlesByCategoryIds(categoryIds) {
  if (!categoryIds.length) return [];

  const { data, error } = await supabase
    .from('articles')
    .select(articleFields)
    .in('category_id', categoryIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCurrentUserArticles() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('articles')
    .select(articleFields)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOwnedArticleBySlug(slug) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('articles')
    .select(articleFields)
    .eq('slug', slug)
    .eq('author_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createArticle(values) {
  const user = await requireUser();
  const baseSlug = slugify(values.title) || 'article';

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await supabase
      .from('articles')
      .insert(toArticleRecord(values, user.id, slug))
      .select(articleFields)
      .single();

    if (!error) return data;
    if (error.code !== '23505') throw error;
  }

  throw new Error('A unique article URL could not be generated. Please adjust the title and try again.');
}

export async function updateArticle(articleId, values) {
  await requireUser();
  const { data, error } = await supabase
    .from('articles')
    .update(toArticleRecord(values))
    .eq('id', articleId)
    .select(articleFields)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('This article was not found or you are not allowed to edit it.');
  return data;
}

export async function deleteArticle(articleId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId)
    .eq('author_id', user.id)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('This article was not found or you are not allowed to delete it.');
  return data;
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function toArticleRecord(values, authorId, slug) {
  return {
    ...(authorId ? { author_id: authorId } : {}),
    ...(slug ? { slug } : {}),
    title: values.title.trim(),
    short_description: values.shortDescription.trim() || null,
    content: values.content.trim(),
    category_id: values.categoryId,
    cover_image_url: values.coverImageUrl.trim() || null,
  };
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to manage articles.');
  return user;
}
