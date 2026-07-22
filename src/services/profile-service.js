import { supabase } from './supabase-client.js';

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, nickname')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
