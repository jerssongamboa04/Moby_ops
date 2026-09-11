import { getSupabaseEnvironment } from '../src/config/environment';
import { supabase } from '../src/lib/supabase/client';
import { createSupabaseClient } from '../src/lib/supabase/create-supabase-client';
import { supabaseSecureStorage } from '../src/lib/supabase/expo-secure-store-driver';

jest.mock('../src/config/environment', () => ({
  getSupabaseEnvironment: jest.fn(() => ({
    supabaseUrl: 'https://example.supabase.co',
    supabasePublishableKey: 'sb_publishable_test',
  })),
}));

jest.mock('../src/lib/supabase/create-supabase-client', () => ({
  createSupabaseClient: jest.fn(() => ({
    kind: 'supabase-client',
  })),
}));

jest.mock(
  '../src/lib/supabase/expo-secure-store-driver',
  () => ({
    supabaseSecureStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
  })
);

describe('supabase client', () => {
  test('uses the validated environment and secure storage', () => {
    expect(getSupabaseEnvironment).toHaveBeenCalledTimes(1);

    expect(createSupabaseClient).toHaveBeenCalledWith({
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_test',
      storage: supabaseSecureStorage,
    });

    expect(supabase).toEqual({
      kind: 'supabase-client',
    });
  });
});