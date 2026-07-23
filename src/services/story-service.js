import { supabase } from './supabase-client.js';

const storyFields = 'id, title, slug, person_name, intro, content, image_url, themes, is_published, created_at, updated_at';

function throwIfError(error) {
  if (error) throw error;
}

export async function getPublishedStories(limit) {
  let query = supabase.from('stories').select(storyFields).eq('is_published', true).order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  throwIfError(error);
  return data;
}

export async function getAllStoriesForAdmin() {
  const { data, error } = await supabase.from('stories').select(storyFields).order('created_at', { ascending: false });
  throwIfError(error);
  return data;
}

export async function getStoryBySlug(slug) {
  const { data, error } = await supabase.from('stories').select(storyFields).eq('slug', slug).maybeSingle();
  throwIfError(error);
  return data;
}

export async function createStory(values) {
  const payload = normalizeStory(values);
  payload.slug = await uniqueSlug(payload.title);
  const { data, error } = await supabase.from('stories').insert(payload).select(storyFields).single();
  throwIfError(error);
  return data;
}

export async function updateStory(id, values) {
  const { data, error } = await supabase.from('stories').update(normalizeStory(values)).eq('id', id).select(storyFields).maybeSingle();
  throwIfError(error);
  if (!data) throw new Error('Story update was not authorized.');
  return data;
}

export async function setStoryPublished(id, isPublished) {
  const { data, error } = await supabase.from('stories').update({ is_published: isPublished }).eq('id', id).select('id, is_published').maybeSingle();
  throwIfError(error);
  if (!data) throw new Error('Story visibility update was not authorized.');
  return data;
}

export async function deleteStory(id) {
  const { data, error } = await supabase.from('stories').delete().eq('id', id).select('id').maybeSingle();
  throwIfError(error);
  if (!data) throw new Error('Story deletion was not authorized.');
}

function normalizeStory(values) {
  return {
    title: values.title.trim(),
    person_name: values.personName.trim(),
    intro: values.intro.trim(),
    content: values.content.trim(),
    image_url: values.imageUrl.trim(),
    themes: Array.isArray(values.themes) ? values.themes : values.themes.split(',').map((theme) => theme.trim()).filter(Boolean),
    is_published: Boolean(values.isPublished),
  };
}

async function uniqueSlug(title) {
  const base = title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'story';
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const slug = suffix ? `${base}-${suffix + 1}` : base;
    const { data, error } = await supabase.from('stories').select('id').eq('slug', slug).maybeSingle();
    throwIfError(error);
    if (!data) return slug;
  }
  throw new Error('A unique story URL could not be created.');
}
