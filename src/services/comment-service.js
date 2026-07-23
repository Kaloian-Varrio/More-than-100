import { supabase } from './supabase-client.js';
import { getCurrentUser } from './auth-service.js';
import { getCurrentUserPermissions } from './role-service.js';

const commentFields = 'id, article_id, author_id, content, created_at, updated_at';

export async function getCommentsForArticle(articleId) {
  const { data: comments, error } = await supabase
    .from('comments')
    .select(commentFields)
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!comments.length) return [];

  const authorIds = [...new Set(comments.map(({ author_id: authorId }) => authorId))];
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, nickname')
    .in('id', authorIds);

  if (profileError) throw profileError;
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  return comments.map((comment) => ({ ...comment, author: profilesById.get(comment.author_id) || null }));
}

export async function getCurrentUserComments() {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to view your comments.');

  const { data: comments, error } = await supabase
    .from('comments')
    .select(commentFields)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!comments.length) return [];

  const articleIds = [...new Set(comments.map(({ article_id: articleId }) => articleId))];
  const { data: articles, error: articleError } = await supabase
    .from('articles')
    .select('id, title, slug')
    .in('id', articleIds);

  if (articleError) throw articleError;
  const articlesById = new Map(articles.map((article) => [article.id, article]));
  return comments.map((comment) => ({ ...comment, article: articlesById.get(comment.article_id) || null }));
}

export async function createComment({ articleId, authorId, content }) {
  await requireCommentPermission();
  const { data, error } = await supabase
    .from('comments')
    .insert({ article_id: articleId, author_id: authorId, content: content.trim() })
    .select(commentFields)
    .single();

  if (error) throw error;
  return data;
}

export async function updateComment({ commentId, authorId, content }) {
  await requireCommentPermission();
  const { data, error } = await supabase
    .from('comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .eq('author_id', authorId)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Comment update was not authorized.');
  return data;
}

export async function deleteComment({ commentId, authorId }) {
  await requireCommentPermission();
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', authorId)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Comment deletion was not authorized.');
}

async function requireCommentPermission() {
  if (!(await getCurrentUserPermissions()).canComment) throw new Error('Reader accounts cannot manage comments.');
}
