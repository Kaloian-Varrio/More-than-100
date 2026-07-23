import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Supabase browser environment variables are required.');

const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const guest = client();
const normal = client();
const admin = client();
const signIn = async (instance, email, password) => {
  const { error } = await instance.auth.signInWithPassword({ email, password });
  if (error) throw error;
};
const selectStories = async (instance) => {
  const { data, error } = await instance.from('stories').select('id, slug, is_published').order('created_at');
  if (error) throw error;
  return data;
};

await signIn(normal, 'john@gmail.com', process.env.SEED_JOHN_PASSWORD);
await signIn(admin, 'kaloianh@gmail.com', process.env.SEED_ADMIN_PASSWORD);
const initial = await selectStories(admin);
if (initial.length !== 3 || initial.some(({ is_published: published }) => !published)) throw new Error('Expected three published seed stories.');
const target = initial[0];

try {
  const { error: unpublishError } = await admin.from('stories').update({ is_published: false }).eq('id', target.id);
  if (unpublishError) throw unpublishError;
  const [guestRows, normalRows, adminRows] = await Promise.all([selectStories(guest), selectStories(normal), selectStories(admin)]);
  if (guestRows.length !== 2 || guestRows.some(({ id }) => id === target.id)) throw new Error('Guest publication policy failed.');
  if (normalRows.length !== 2 || normalRows.some(({ id }) => id === target.id)) throw new Error('Authenticated publication policy failed.');
  if (adminRows.length !== 3 || !adminRows.some(({ id }) => id === target.id)) throw new Error('Admin read policy failed.');
  const { data: forbiddenUpdate, error: normalUpdateError } = await normal.from('stories').update({ title: 'Unauthorized update' }).eq('id', target.id).select('id');
  if (normalUpdateError || forbiddenUpdate?.length) throw new Error('Normal user story update policy failed.');
  console.log('Story RLS passed: guest 2/3, normal user 2/3, admin 3/3, normal update denied.');
} finally {
  const { error } = await admin.from('stories').update({ is_published: true }).eq('id', target.id);
  if (error) throw error;
  const restored = await selectStories(admin);
  if (restored.length !== 3 || restored.some(({ is_published: published }) => !published)) throw new Error('Seed story restoration failed.');
  await Promise.all([normal.auth.signOut(), admin.auth.signOut()]);
  console.log('Seed stories restored to three published records.');
}
