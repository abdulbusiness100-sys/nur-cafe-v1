// src/services/auth.ts
import { supabase } from '../config/supabase';
import type { Profile } from '../types/database';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, name: string) {
  // Pass name in metadata — the handle_new_user DB trigger creates the profile row
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name.trim() } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(uid: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) return null;
  return data;
}

export async function updateProfile(uid: string, updates: Partial<Pick<Profile, 'name'>>) {
  const { error } = await (supabase as any).from('profiles').update(updates).eq('id', uid);
  if (error) throw error;
}
