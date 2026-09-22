import type { SupabaseClient } from '@supabase/supabase-js';

export type OwnProfile = {
  id: string;
  role: 'employee' | 'supervisor';
  is_active: boolean;
};

export type ProfileClient = Pick<SupabaseClient, 'from'>;

export async function getOwnProfile(
  client: ProfileClient
): Promise<OwnProfile | null> {
  const { data, error } = await client
    .from('profiles')
    .select('id, role, is_active')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data === null) {
    return null;
  }

  if (
    typeof data.id !== 'string' ||
    (data.role !== 'employee' && data.role !== 'supervisor') ||
    typeof data.is_active !== 'boolean'
  ) {
    throw new Error('Invalid profile response');
  }

  return {
    id: data.id,
    role: data.role,
    is_active: data.is_active,
  };
}