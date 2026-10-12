import { getSupabaseEnvironment } from '../../config/environment';
import { createSupabaseClient } from './create-supabase-client';
import { supabaseSecureStorage } from './expo-secure-store-driver';

const {
  supabaseUrl,
  supabasePublishableKey,
} = getSupabaseEnvironment();

export const supabase = createSupabaseClient({
  supabaseUrl,
  supabasePublishableKey,
  storage: supabaseSecureStorage,
});