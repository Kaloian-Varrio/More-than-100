import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !publishableKey || !serviceRoleKey) throw new Error('Supabase test environment variables are required.');

const browserClient = () => createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const service = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = browserClient();
const member = browserClient();
const guest = browserClient();
const testEmail = `role-security-${Date.now()}@example.com`;
const testPassword = `Role-${crypto.randomUUID()}-A1!`;
let testUserId;
let articleId;
let commentId;
let storagePath;

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const signIn = async (client, email, password) => {
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
};
const invoke = async (client, body) => {
  const { data, error } = await client.functions.invoke('admin-users', { body });
  if (!error) return { ok: true, data, status: 200 };
  let response = {};
  try { response = await error.context?.json(); } catch { /* Safe fallback below. */ }
  return { ok: false, data: response, status: error.context?.status || 0 };
};
const setRole = async (role) => {
  const result = await invoke(admin, { action: 'set-role', targetUserId: testUserId, role });
  assert(result.ok && result.data?.role === role, `Admin could not set ${role} role: ${result.status} ${JSON.stringify(result.data)}`);
};
const expectDenied = (result, message) => {
  assert(result.error || !result.data?.length, message);
};

try {
  await signIn(admin, 'kaloianh@gmail.com', process.env.SEED_ADMIN_PASSWORD);
  const { data: created, error: createUserError } = await service.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });
  if (createUserError) throw createUserError;
  testUserId = created.user.id;
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { data: initialRole, error: initialRoleError } = await service.from('user_roles').select('role').eq('user_id', testUserId).single();
  if (initialRoleError) throw initialRoleError;
  assert(initialRole.role === 'user', 'Signup did not create the default user role.');
  await signIn(member, testEmail, testPassword);

  const guestEndpoint = await invoke(guest, { action: 'set-role', targetUserId: testUserId, role: 'reader' });
  assert(!guestEndpoint.ok && [401, 403].includes(guestEndpoint.status), 'Guest role endpoint request was not rejected.');
  const userEndpoint = await invoke(member, { action: 'set-role', targetUserId: testUserId, role: 'admin' });
  assert(!userEndpoint.ok && userEndpoint.status === 403, 'Normal user role endpoint request was not rejected.');

  const { data: category, error: categoryError } = await member.from('categories').select('id').limit(1).single();
  if (categoryError) throw categoryError;
  const slug = `role-security-${Date.now()}`;
  const { data: article, error: articleError } = await member.from('articles').insert({
    author_id: testUserId,
    category_id: category.id,
    title: 'Disposable role security article',
    slug,
    short_description: 'Temporary security verification record.',
    content: 'Temporary content for role security verification.',
  }).select('id').single();
  if (articleError) throw articleError;
  articleId = article.id;
  const { data: comment, error: commentError } = await member.from('comments').insert({
    article_id: articleId,
    author_id: testUserId,
    content: 'Temporary role security comment.',
  }).select('id').single();
  if (commentError) throw commentError;
  commentId = comment.id;
  storagePath = `${testUserId}/role-security/cover.jpg`;
  const { error: uploadError } = await member.storage.from('article-images').upload(storagePath, new Blob([new Uint8Array([255, 216, 255, 217])], { type: 'image/jpeg' }), { contentType: 'image/jpeg' });
  if (uploadError) throw uploadError;

  await setRole('reader');
  const readerEndpoint = await invoke(member, { action: 'set-role', targetUserId: testUserId, role: 'user' });
  assert(!readerEndpoint.ok && readerEndpoint.status === 403, 'Reader role endpoint request was not rejected.');

  const { data: publishedArticles, error: publishedError } = await member.from('articles').select('id').eq('id', articleId);
  if (publishedError) throw publishedError;
  assert(publishedArticles.length === 1, 'Reader could not read a published article.');
  const { data: publishedStories, error: storiesError } = await member.from('stories').select('id').eq('is_published', true).limit(1);
  if (storiesError) throw storiesError;
  assert(publishedStories.length === 1, 'Reader could not read a published Story.');

  const articleInsert = await member.from('articles').insert({ author_id: testUserId, category_id: category.id, title: 'Denied', slug: `${slug}-denied`, content: 'Denied' });
  expectDenied(articleInsert, 'Reader article INSERT was allowed.');
  const articleUpdate = await member.from('articles').update({ title: 'Denied update' }).eq('id', articleId).select('id');
  expectDenied(articleUpdate, 'Reader article UPDATE was allowed.');
  const articleDelete = await member.from('articles').delete().eq('id', articleId).select('id');
  expectDenied(articleDelete, 'Reader article DELETE was allowed.');
  const commentInsert = await member.from('comments').insert({ article_id: articleId, author_id: testUserId, content: 'Denied' });
  expectDenied(commentInsert, 'Reader comment INSERT was allowed.');
  const commentUpdate = await member.from('comments').update({ content: 'Denied' }).eq('id', commentId).select('id');
  expectDenied(commentUpdate, 'Reader comment UPDATE was allowed.');
  const commentDelete = await member.from('comments').delete().eq('id', commentId).select('id');
  expectDenied(commentDelete, 'Reader comment DELETE was allowed.');
  const storyUpdate = await member.from('stories').update({ intro: 'Denied' }).eq('id', publishedStories[0].id).select('id');
  expectDenied(storyUpdate, 'Reader Story UPDATE was allowed.');
  const { error: readerUploadError } = await member.storage.from('article-images').upload(`${testUserId}/role-security/denied.jpg`, new Blob([new Uint8Array([255, 216, 255, 217])], { type: 'image/jpeg' }), { contentType: 'image/jpeg' });
  assert(readerUploadError, 'Reader article-image upload was allowed.');

  const { error: unpublishError } = await service.from('articles').update({ is_published: false }).eq('id', articleId);
  if (unpublishError) throw unpublishError;
  const { data: hiddenOwnArticle, error: hiddenError } = await member.from('articles').select('id').eq('id', articleId);
  if (hiddenError) throw hiddenError;
  assert(hiddenOwnArticle.length === 0, 'Reader could read an unpublished owned article.');
  await service.from('articles').update({ is_published: true }).eq('id', articleId);

  const directRoleUpdate = await admin.from('user_roles').update({ role: 'admin' }).eq('user_id', testUserId).select('role');
  expectDenied(directRoleUpdate, 'Direct browser role mutation was allowed.');
  const directUserRoleUpdate = await member.from('user_roles').update({ role: 'admin' }).eq('user_id', testUserId).select('role');
  expectDenied(directUserRoleUpdate, 'Reader direct role mutation was allowed.');

  await setRole('user');
  const { data: updatedArticle, error: userArticleUpdateError } = await member.from('articles').update({ title: 'Updated by standard user' }).eq('id', articleId).select('id');
  if (userArticleUpdateError) throw userArticleUpdateError;
  assert(updatedArticle.length === 1, 'Standard user could not update their article.');
  const { data: updatedComment, error: userCommentUpdateError } = await member.from('comments').update({ content: 'Updated by standard user.' }).eq('id', commentId).select('id');
  if (userCommentUpdateError) throw userCommentUpdateError;
  assert(updatedComment.length === 1, 'Standard user could not update their comment.');
  await setRole('reader');
  await setRole('user');
  await setRole('admin');
  await setRole('user');

  const invalidRole = await invoke(admin, { action: 'set-role', targetUserId: testUserId, role: 'owner' });
  assert(!invalidRole.ok && invalidRole.status === 400, 'Invalid role was not rejected.');
  const { data: adminUser } = await admin.auth.getUser();
  const lastAdminDemotion = await invoke(admin, { action: 'set-role', targetUserId: adminUser.user.id, role: 'user' });
  assert(!lastAdminDemotion.ok && lastAdminDemotion.status === 409, 'Last administrator demotion was not rejected.');

  const { error: storageCleanupError } = await member.storage.from('article-images').remove([storagePath]);
  if (storageCleanupError) throw storageCleanupError;
  const deleteResult = await invoke(admin, { action: 'delete', targetUserId: testUserId });
  assert(deleteResult.ok, `Secure user deletion regression test failed: ${deleteResult.status} ${JSON.stringify(deleteResult.data)}`);
  const [profileRows, roleRows, articleRows, commentRows] = await Promise.all([
    service.from('profiles').select('id').eq('id', testUserId),
    service.from('user_roles').select('user_id').eq('user_id', testUserId),
    service.from('articles').select('id').eq('author_id', testUserId),
    service.from('comments').select('id').eq('author_id', testUserId),
  ]);
  assert([profileRows, roleRows, articleRows, commentRows].every(({ data, error }) => !error && data.length === 0), 'Secure deletion left related database records.');
  testUserId = null;
  console.log('Role security passed: default user, reader restrictions, user CRUD, admin transitions, endpoint authorization, last-admin protection, Storage RLS and secure deletion.');
} finally {
  if (testUserId) {
    if (storagePath) await service.storage.from('article-images').remove([storagePath]);
    await service.auth.admin.deleteUser(testUserId);
  }
  await Promise.all([admin.auth.signOut(), member.auth.signOut()]);
}
