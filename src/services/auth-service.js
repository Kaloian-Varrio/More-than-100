import { supabase } from './supabase-client.js';

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (error.name === 'AuthSessionMissingError') return null;
    throw error;
  }
  return data.user;
}

export async function isAuthenticated() {
  return Boolean(await getCurrentUser());
}

export async function registerUser({ email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  if (!data.user || data.user.identities?.length === 0) {
    throw new Error('An account with this email already exists. Try logging in instead.');
  }

  return data;
}

export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null));
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.replace('/login');
    return null;
  }
  return user;
}
