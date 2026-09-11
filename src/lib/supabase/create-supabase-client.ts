import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

import type { SupabaseStorageAdapter } from './secure-store-adapter';

export type CreateSupabaseClientOptions = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  storage: SupabaseStorageAdapter;
};

export function createSupabaseClient({
  supabaseUrl,
  supabasePublishableKey,
  storage,
}: CreateSupabaseClientOptions) {
  return createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );
}