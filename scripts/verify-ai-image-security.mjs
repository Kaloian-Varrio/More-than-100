import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !publishableKey || !serviceRoleKey) throw new Error('Supabase test environment variables are required.');

const client = () => createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const service = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = client();
const member = client();
const guest = client();
const email = `ai-image-security-${Date.now()}@example.com`;
const password = `Image-${crypto.randomUUID()}-A1!`;
let userId;

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const signIn = async (instance, userEmail, userPassword) => {
  const { error } = await instance.auth.signInWithPassword({ email: userEmail, password: userPassword });
  if (error) throw error;
};
const invokeImage = async (instance, body) => {
  const { data, error } = await instance.functions.invoke('generate-cover-image', { body });
  if (!error) return { ok: true, status: 200, data };
  let response = {};
  try { response = await error.context?.json(); } catch { /* Safe fallback below. */ }
  return { ok: false, status: error.context?.status || 0, data: response };
};
const setRole = async (role) => {
  const { data, error } = await admin.functions.invoke('admin-users', { body: { action: 'set-role', targetUserId: userId, role } });
  if (error || data?.role !== role) throw new Error(`Could not assign ${role} during AI security testing.`);
};
const articleRequest = (extra = {}) => ({
  contentType: 'article',
  context: { title: 'A healthy morning walk', description: 'A practical outdoor movement routine.', category: 'Movement', topic: 'walking and energy' },
  ...extra,
});
const storyRequest = {
  contentType: 'story',
  context: { title: 'Small Steps Outdoors', personName: 'Demo person', intro: 'A positive fictional longevity story.', themes: 'Movement, Nature', summary: 'Consistent outdoor activity.' },
};

try {
  await signIn(admin, 'kaloianh@gmail.com', process.env.SEED_ADMIN_PASSWORD);
  const { data: created, error: createError } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError) throw createError;
  userId = created.user.id;
  await new Promise((resolve) => setTimeout(resolve, 500));
  await signIn(member, email, password);

  const guestResult = await invokeImage(guest, articleRequest());
  assert(!guestResult.ok && [401, 403].includes(guestResult.status), 'Guest image generation was not rejected.');
  const userStory = await invokeImage(member, storyRequest);
  assert(!userStory.ok && userStory.status === 403, 'Standard user Story image generation was not rejected.');
  const { data: otherArticle, error: articleError } = await service.from('articles').select('id').neq('author_id', userId).limit(1).single();
  if (articleError) throw articleError;
  const otherArticleResult = await invokeImage(member, articleRequest({ articleId: otherArticle.id }));
  assert(!otherArticleResult.ok && otherArticleResult.status === 403, 'Standard user could generate for another author’s Article.');
  const invalidContext = await invokeImage(member, { contentType: 'article', context: { title: 'x' } });
  assert(!invalidContext.ok && invalidContext.status === 400, 'Server-side context validation did not reject a short title.');

  await setRole('reader');
  const readerArticle = await invokeImage(member, articleRequest());
  const readerStory = await invokeImage(member, storyRequest);
  assert(!readerArticle.ok && readerArticle.status === 403, 'Reader Article image generation was not rejected.');
  assert(!readerStory.ok && readerStory.status === 403, 'Reader Story image generation was not rejected.');
  await setRole('user');

  if (process.env.AI_EXPECT_PROVIDER_DISABLED === 'true') {
    const userArticle = await invokeImage(member, articleRequest());
    const adminArticle = await invokeImage(admin, articleRequest());
    const adminStory = await invokeImage(admin, storyRequest);
    for (const [label, result] of [['User Article', userArticle], ['Admin Article', adminArticle], ['Admin Story', adminStory]]) {
      assert(!result.ok && result.status === 503 && result.data?.code === 'provider_not_configured', `${label} did not return the expected provider-disabled response.`);
    }
  } else {
    console.log('Provider-disabled generation calls skipped. Set AI_EXPECT_PROVIDER_DISABLED=true only when the deployed provider secret is intentionally absent.');
  }

  const deleteResult = await admin.functions.invoke('admin-users', { body: { action: 'delete', targetUserId: userId } });
  if (deleteResult.error) throw deleteResult.error;
  userId = null;
  console.log('AI image authorization passed: guest, Reader, Story, ownership and validation restrictions.');
} finally {
  if (userId) await service.auth.admin.deleteUser(userId);
  await Promise.all([admin.auth.signOut(), member.auth.signOut()]);
}
