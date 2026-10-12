export type SupabaseEnvironmentSource = {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

export type SupabaseEnvironment = {
  supabaseUrl: string;
  supabasePublishableKey: string;
};

const runtimeEnvironment: SupabaseEnvironmentSource = {
  EXPO_PUBLIC_SUPABASE_URL:
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

function getRequiredVariable(
  environment: SupabaseEnvironmentSource,
  variableName: keyof SupabaseEnvironmentSource
): string {
  const value = environment[variableName]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${variableName}`
    );
  }

  return value;
}

export function getSupabaseEnvironment(
  environment: SupabaseEnvironmentSource = runtimeEnvironment
): SupabaseEnvironment {
  const supabaseUrl = getRequiredVariable(
    environment,
    'EXPO_PUBLIC_SUPABASE_URL'
  );

  const supabasePublishableKey = getRequiredVariable(
    environment,
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
  );

  if (supabasePublishableKey.startsWith('sb_secret_')) {
    throw new Error(
      'A Supabase secret key cannot be used in the mobile app.'
    );
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}