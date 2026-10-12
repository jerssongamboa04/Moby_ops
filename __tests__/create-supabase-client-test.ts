import { createClient } from '@supabase/supabase-js';

import { createSupabaseClient } from '../src/lib/supabase/create-supabase-client';
import type { SupabaseStorageAdapter } from '../src/lib/supabase/secure-store-adapter';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('createSupabaseClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a client with persistent mobile authentication', () => {
    const storage: SupabaseStorageAdapter = {
      getItem: jest.fn(async () => null),
      setItem: jest.fn(async () => undefined),
      removeItem: jest.fn(async () => undefined),
    };

    createSupabaseClient({
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_test',
      storage,
    });

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'sb_publishable_test',
      {
        auth: {
          storage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );
  });
});