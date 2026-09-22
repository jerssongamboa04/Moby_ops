import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStatus } from '@/src/features/auth/hooks/use-auth-status';
import { ProfileAccessScreen } from '@/src/features/auth/screens/profile-access-screen';
import { SignInScreen } from '@/src/features/auth/screens/sign-in-screen';
import { useAuthCallbackStore } from '@/src/features/auth/store/auth-callback-store';
import { supabase } from '@/src/lib/supabase/client';
import { signIn } from '@/src/lib/supabase/sign-in';
import { colors, spacing } from '@/src/theme/tokens';

export default function Index() {
  const { t } = useTranslation('auth');
  const authStatus = useAuthStatus(supabase);
  const callbackStatus = useAuthCallbackStore(
    (state) => state.status
  );

  const handleSubmit = async (
    email: string,
    password: string
  ): Promise<void> => {
    await signIn(supabase, email, password);
  };

  const handleSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut({
      scope: 'local',
    });

    if (error) {
      throw error;
    }
  };

  if (
    authStatus === 'loading' ||
    callbackStatus === 'processing'
  ) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator
          accessibilityLabel={t('sessionLoading')}
          color={colors.ink}
        />
        <Text style={styles.loadingText}>
          {t('sessionLoading')}
        </Text>
      </SafeAreaView>
    );
  }

  if (authStatus === 'authenticated') {
    return <ProfileAccessScreen onSignOut={handleSignOut} />;
  }

  return <SignInScreen onSubmit={handleSubmit} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.charcoal,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});