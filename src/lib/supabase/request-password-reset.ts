import type { SupabaseClient } from '@supabase/supabase-js';

export async function requestPasswordReset(client: { auth: Pick<SupabaseClient['auth'], 'resetPasswordForEmail'> }, email: string): Promise<void> {
  const normalized = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Invalid email');
  const { error } = await client.auth.resetPasswordForEmail(normalized, {
    redirectTo: 'mobyops://auth/callback',
  });
  if (error) throw error;
}
