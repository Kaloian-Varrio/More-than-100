import { supabase } from './supabase-client.js';
import { getCurrentUser } from './auth-service.js';

const publicProfileFields = 'id, first_name, last_name, nickname, bio, avatar_url, website_url, instagram_url, facebook_url, created_at';

export async function getMembers() {
  await requireMember();
  const { data, error } = await supabase
    .from('profiles')
    .select(publicProfileFields)
    .order('first_name')
    .order('last_name')
    .order('created_at');

  if (error) throw error;
  return data;
}

export async function getMemberByNickname(nickname) {
  await requireMember();
  const { data, error } = await supabase
    .from('profiles')
    .select(publicProfileFields)
    .eq('nickname', nickname)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function requireMember() {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to view community members.');
  return user;
}
