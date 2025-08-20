// src/auth.ts
import { supabase } from './lib/supabaseClient';

export async function signInWithEmail(email: string, password: string) {
  const { user, session, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user, session, error };
}
