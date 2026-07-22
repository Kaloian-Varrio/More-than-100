import { supabase } from './supabase-client.js';

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, description')
    .order('name');

  if (error) throw error;
  return data;
}

export function buildCategoryTree(categories) {
  const childrenByParent = new Map();
  categories.forEach((category) => {
    const siblings = childrenByParent.get(category.parent_id) || [];
    siblings.push(category);
    childrenByParent.set(category.parent_id, siblings);
  });

  return (childrenByParent.get(null) || []).map((category) => ({
    ...category,
    children: childrenByParent.get(category.id) || [],
  }));
}

export async function getCategoryBySlug(slug) {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;

  return {
    ...category,
    children: categories.filter((item) => item.parent_id === category.id),
    parent: categories.find((item) => item.id === category.parent_id) || null,
  };
}
