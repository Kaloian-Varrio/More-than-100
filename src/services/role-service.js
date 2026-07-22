import { supabase } from './supabase-client.js';
import { getCurrentUser, requireAuthenticatedUser } from './auth-service.js';

export async function getCurrentUserRole() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return data?.role || 'user';
}

export async function isCurrentUserAdmin() { return (await getCurrentUserRole()) === 'admin'; }

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();
  if (!user) return null;
  if (!(await isCurrentUserAdmin())) {
    window.location.replace('/dashboard');
    return null;
  }
  return user;
}
