import { supabase } from './supabase-client.js';

const articleFields = `
  id, author_id, category_id, title, slug, short_description,
  content, cover_image_url, created_at,
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
