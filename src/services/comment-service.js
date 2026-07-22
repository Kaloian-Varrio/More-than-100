import { supabase } from './supabase-client.js';

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

export async function createComment({ articleId, authorId, content }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ article_id: articleId, author_id: authorId, content: content.trim() })
    .select(commentFields)
    .single();

  if (error) throw error;
  return data;
}

export async function updateComment({ commentId, authorId, content }) {
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
