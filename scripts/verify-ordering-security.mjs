import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !publishableKey || !serviceRoleKey) throw new Error('Supabase test environment variables are required.');

const client = () => createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const service = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = client();
const member = client();
const reader = client();
const guest = client();
const email = `ordering-${Date.now()}@example.com`;
const password = `Order-${crypto.randomUUID()}-A1!`;
let userId;
let articleIds = [];
let commentIds = [];

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const signIn = async (instance, login, secret) => {
  const { error } = await instance.auth.signInWithPassword({ email: login, password: secret });
  if (error) throw error;
};
const reorder = (instance, scope, ids) => instance.rpc('reorder_management_items', {
  order_scope: scope,
  ordered_ids: ids,
});
const ids = (rows) => rows.map(({ id }) => id);
const reverseFirstPair = (values) => values.length > 1
  ? [values[1], values[0], ...values.slice(2)]
  : values;
const expectDenied = (result, message) => assert(result.error, message);
const setRole = async (role) => {
  const { data, error } = await admin.functions.invoke('admin-users', {
    body: { action: 'set-role', targetUserId: userId, role },
  });
  if (error) {
    let detail = error.message;
    try { detail = (await error.context?.json())?.error || detail; } catch { /* Keep safe fallback. */ }
    throw new Error(`Role change to ${role} failed: ${detail}`);
  }
  if (data?.error) throw new Error(data.error);
};

try {
  await signIn(admin, 'kaloianh@gmail.com', process.env.SEED_ADMIN_PASSWORD);
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) throw createError;
  userId = created.user.id;
  await new Promise((resolve) => setTimeout(resolve, 500));
  await signIn(member, email, password);

  const { data: category, error: categoryError } = await service.from('categories').select('id').limit(1).single();
  if (categoryError) throw categoryError;
  const slug = `ordering-${Date.now()}`;
  const { data: articles, error: articleError } = await member.from('articles').insert([
    { author_id: userId, category_id: category.id, title: 'Ordering test A', slug: `${slug}-a`, content: 'Temporary ordering test article A.' },
    { author_id: userId, category_id: category.id, title: 'Ordering test B', slug: `${slug}-b`, content: 'Temporary ordering test article B.' },
  ]).select('id');
  if (articleError) throw articleError;
  articleIds = ids(articles);

  const { data: comments, error: commentError } = await member.from('comments').insert([
    { article_id: articleIds[0], author_id: userId, content: 'Temporary ordering comment A.' },
    { article_id: articleIds[0], author_id: userId, content: 'Temporary ordering comment B.' },
  ]).select('id');
  if (commentError) throw commentError;
  commentIds = ids(comments);

  const reversedArticles = [...articleIds].reverse();
  const reversedComments = [...commentIds].reverse();
  assert(!(await reorder(member, 'owner_articles', reversedArticles)).error, 'User could not reorder owned articles.');
  assert(!(await reorder(member, 'owner_comments', reversedComments)).error, 'User could not reorder owned comments.');

  const { data: savedArticles } = await member.from('articles').select('id').in('id', articleIds).order('owner_order');
  const { data: savedComments } = await member.from('comments').select('id').in('id', commentIds).order('owner_order');
  assert(JSON.stringify(ids(savedArticles)) === JSON.stringify(reversedArticles), 'Owner article order did not persist.');
  assert(JSON.stringify(ids(savedComments)) === JSON.stringify(reversedComments), 'Owner comment order did not persist.');

  const { data: otherArticle } = await service.from('articles').select('id').neq('author_id', userId).limit(1).single();
  const { data: otherComment } = await service.from('comments').select('id').neq('author_id', userId).limit(1).single();
  expectDenied(await reorder(member, 'owner_articles', [otherArticle.id]), 'User reordered another author’s article.');
  expectDenied(await reorder(member, 'owner_comments', [otherComment.id]), 'User reordered another author’s comment.');
  for (const scope of ['admin_articles', 'admin_stories', 'admin_users', 'admin_comments']) {
    expectDenied(await reorder(member, scope, [scope === 'admin_users' ? userId : scope === 'admin_stories'
      ? (await service.from('stories').select('id').limit(1).single()).data.id
      : scope === 'admin_comments' ? commentIds[0] : articleIds[0]]), `User accessed ${scope}.`);
  }
  expectDenied(await member.from('articles').update({ display_order: 1 }).eq('id', articleIds[0]), 'Direct global Article ordering update was allowed.');
  expectDenied(await member.from('comments').update({ admin_order: 1 }).eq('id', commentIds[0]), 'Direct Admin Comment ordering update was allowed.');

  await setRole('reader');
  await signIn(reader, email, password);
  expectDenied(await reorder(reader, 'owner_articles', articleIds), 'Reader reordered articles.');
  expectDenied(await reorder(reader, 'owner_comments', commentIds), 'Reader reordered comments.');
  await setRole('user');

  const adminScopes = [
    ['admin_articles', 'articles', 'display_order'],
    ['admin_stories', 'stories', 'display_order'],
    ['admin_users', 'profiles', 'admin_order'],
    ['admin_comments', 'comments', 'admin_order'],
  ];
  for (const [scope, table, column] of adminScopes) {
    const { data: rows, error } = await service.from(table).select('id').order(column).limit(50);
    if (error) throw error;
    const original = ids(rows);
    const reordered = reverseFirstPair(original);
    assert(!(await reorder(admin, scope, reordered)).error, `Admin could not reorder ${table}.`);
    const { data: persisted } = await service.from(table).select('id').in('id', reordered).order(column);
    assert(JSON.stringify(ids(persisted)) === JSON.stringify(reordered), `${table} order did not persist.`);
    assert(!(await reorder(admin, scope, original)).error, `${table} order could not be restored.`);
  }

  const { data: publicStories, error: publicStoryError } = await guest.from('stories').select('id, is_published, display_order').order('display_order').order('created_at', { ascending: false });
  if (publicStoryError) throw publicStoryError;
  assert(publicStories.every(({ is_published: published }) => published), 'Public Stories exposed unpublished content.');
  assert(publicStories.every((story, index) => index === 0 || story.display_order >= publicStories[index - 1].display_order), 'Public Story order was not curated.');

  const { data: publicArticles, error: publicArticleError } = await guest.from('articles').select('id, is_published, display_order').order('display_order').order('created_at', { ascending: false });
  if (publicArticleError) throw publicArticleError;
  assert(publicArticles.every(({ is_published: published }) => published), 'Public Articles exposed unpublished content.');

  const { data: chronologicalComments, error: chronologicalError } = await guest.from('comments').select('id, created_at').eq('article_id', articleIds[0]).order('created_at');
  if (chronologicalError) throw chronologicalError;
  assert(chronologicalComments.every((comment, index) => index === 0 || comment.created_at >= chronologicalComments[index - 1].created_at), 'Public comment chronology changed.');

  console.log('Ordering security passed: Admin scopes, owner scopes, Reader denial, direct-column denial, persistence and public ordering.');
} finally {
  if (userId) {
    const { error } = await service.auth.admin.deleteUser(userId);
    if (error) console.warn(`Temporary ordering user cleanup failed: ${error.message}`);
  }
}
