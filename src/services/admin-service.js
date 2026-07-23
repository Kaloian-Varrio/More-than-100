import { supabase } from './supabase-client.js';
import { getAllArticles } from './article-service.js';
import { getAllStoriesForAdmin } from './story-service.js';

const profileFields = 'id, first_name, last_name, nickname, bio, avatar_url, website_url, instagram_url, facebook_url, admin_order, created_at, updated_at';

export async function getAdminOverviewData() {
  const [profilesResult, rolesResult, articles, stories, commentsResult, authUsers] = await Promise.all([
    supabase.from('profiles').select(profileFields).order('admin_order').order('created_at'),
    supabase.from('user_roles').select('user_id, role').order('created_at'),
    getAllArticles(),
    getAllStoriesForAdmin(),
    supabase.from('comments').select('id, article_id, author_id, content, admin_order, owner_order, created_at, updated_at').order('admin_order').order('created_at', { ascending: false }),
    invokeAdminUsers({ action: 'list' }).then(({ users }) => users),
  ]);
  const error = profilesResult.error || rolesResult.error || commentsResult.error;
  if (error) throw error;
  const profilesById = new Map(profilesResult.data.map((profile) => [profile.id, profile]));
  const articlesById = new Map(articles.map((article) => [article.id, article]));
  return {
    profiles: profilesResult.data.map((profile) => ({
      ...profile,
      role: rolesResult.data.find(({ user_id: userId }) => userId === profile.id)?.role || 'user',
      email: authUsers.find(({ id }) => id === profile.id)?.email || null,
    })),
    articles: articles.map((article) => ({ ...article, author: profilesById.get(article.author_id) || null })),
    stories,
    comments: commentsResult.data.map((comment) => ({ ...comment, author: profilesById.get(comment.author_id) || null, article: articlesById.get(comment.article_id) || null })),
  };
}

export async function updateProfileAsAdmin(profileId, values) {
  const { data, error } = await supabase.from('profiles').update({ first_name: values.firstName.trim(), last_name: values.lastName.trim(), nickname: values.nickname.trim(), bio: values.bio.trim() || null }).eq('id', profileId).select(profileFields).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Profile update was not authorized.');
  return data;
}

export async function deleteArticleAsAdmin(articleId) {
  const { data, error } = await supabase.from('articles').delete().eq('id', articleId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Article deletion was not authorized.');
}

export async function deleteCommentAsAdmin(commentId) {
  const { data, error } = await supabase.from('comments').delete().eq('id', commentId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Comment deletion was not authorized.');
}

export async function updateCommentAsAdmin(commentId, content) {
  const { data, error } = await supabase
    .from('comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .select('id, content, updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Comment update was not authorized.');
  return data;
}

export async function setArticlePublishedAsAdmin(articleId, isPublished) {
  const { data, error } = await supabase
    .from('articles')
    .update({ is_published: isPublished })
    .eq('id', articleId)
    .select('id, is_published')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Article visibility update was not authorized.');
  return data;
}

export async function deleteUserAsAdmin(targetUserId) {
  return invokeAdminUsers({ action: 'delete', targetUserId });
}

export async function setUserRoleAsAdmin(targetUserId, role) {
  return invokeAdminUsers({ action: 'set-role', targetUserId, role });
}

async function invokeAdminUsers(body) {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  if (error) {
    let message = 'The secure admin request failed.';
    try {
      const responseBody = await error.context?.json();
      if (responseBody?.error) message = responseBody.error;
    } catch {
      // Keep the safe fallback message when the response body is unavailable.
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
