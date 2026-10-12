import { getSupabaseEnvironment } from '../src/config/environment';

const validEnvironment = {
  EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
};

describe('getSupabaseEnvironment', () => {
  test('returns the normalized public Supabase configuration', () => {
    expect(
      getSupabaseEnvironment({
        EXPO_PUBLIC_SUPABASE_URL:
          '  https://example.supabase.co  ',
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          '  sb_publishable_example  ',
      })
    ).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_example',
    });
  });

  test.each([
    [
      'EXPO_PUBLIC_SUPABASE_URL',
      {
        ...validEnvironment,
        EXPO_PUBLIC_SUPABASE_URL: '',
      },
    ],
    [
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      {
        ...validEnvironment,
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '',
      },
    ],
  ])('throws when %s is missing', (variableName, environment) => {
    expect(() => getSupabaseEnvironment(environment)).toThrow(
      `Missing required environment variable: ${variableName}`
    );
  });

  test('rejects a Supabase secret key', () => {
    expect(() =>
      getSupabaseEnvironment({
        ...validEnvironment,
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          'sb_secret_example-do-not-use',
      })
    ).toThrow(
      'A Supabase secret key cannot be used in the mobile app.'
    );
  });
});