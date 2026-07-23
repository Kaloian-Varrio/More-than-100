import { supabase } from './supabase-client.js';
import { getCurrentUser, requireAuthenticatedUser } from './auth-service.js';

export const appRoles = Object.freeze({
  reader: 'reader',
  user: 'user',
  admin: 'admin',
});

export async function getCurrentUserRole() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return data?.role || 'reader';
}

export async function isCurrentUserAdmin() { return (await getCurrentUserRole()) === 'admin'; }

export function getRolePermissions(role) {
  const isAdmin = role === appRoles.admin;
  const canContribute = role === appRoles.user || isAdmin;
  return {
    role,
    isAdmin,
    isReadOnly: role === appRoles.reader,
    canCreateContent: canContribute,
    canComment: canContribute,
  };
}

export async function getCurrentUserPermissions() {
  return getRolePermissions(await getCurrentUserRole());
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();
  if (!user) return null;
  if (!(await isCurrentUserAdmin())) {
    window.location.replace('/dashboard');
    return null;
  }
  return user;
}
