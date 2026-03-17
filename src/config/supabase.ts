// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import type { Database } from '../types/database';

const SUPABASE_URL = 'https://rxnwtonbumbwoqfcpnds.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bnd0b25idW1id29xZmNwbmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjU3NDQsImV4cCI6MjA4ODMwMTc0NH0.ez2AepIHQAZuWEhA2w1zZZ6nyuNxbOnZiJkd5_ZB7fE';

// SecureStore adapter for persisting Supabase auth session
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
