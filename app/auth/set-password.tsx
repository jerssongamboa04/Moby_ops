import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    SetPasswordScreen,
} from '@/src/features/auth/screens/set-password-screen';
import { supabase } from '@/src/lib/supabase/client';
import {
    setPassword,
} from '@/src/lib/supabase/set-password';
import {
    colors,
    radii,
    spacing,
} from '@/src/theme/tokens';

export default function SetPasswordRoute() {
  const { t } = useTranslation('auth');

  const [hasSession, setHasSession] = useState(false);
  const [isPasswordSaved, setIsPasswordSaved] =
    useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasSignOutError, setHasSignOutError] =
    useState(false);

  const signOutInProgress = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    let isCurrentCheck = true;

    const checkSession = async (): Promise<void> => {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (!isCurrentCheck) {
          return;
        }

        if (error || !data.session) {
          router.replace('/');
          return;
        }

        setHasSession(true);
      } catch {
        if (isCurrentCheck) {
          router.replace('/');
        }
      }
    };

    void checkSession();

    return () => {
      isCurrentCheck = false;
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (
    password: string
  ): Promise<void> => {
    await setPassword(supabase, password);

    if (isMounted.current) {
      setIsPasswordSaved(true);
    }
  };

  const handleBackToSignIn = async (): Promise<void> => {
    if (!isPasswordSaved || signOutInProgress.current) {
      return;
    }

    signOutInProgress.current = true;
    setIsSigningOut(true);
    setHasSignOutError(false);

    try {
      const { error } = await supabase.auth.signOut({
        scope: 'local',
      });

      if (error) {
        throw error;
      }
    } catch {
      signOutInProgress.current = false;

      if (isMounted.current) {
        setHasSignOutError(true);
        setIsSigningOut(false);
      }

      return;
    }

    if (isMounted.current) {
      router.replace('/');
    }
  };

  if (!hasSession) {
    return null;
  }

  if (isPasswordSaved) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text
              accessibilityRole="header"
              accessibilityLiveRegion="polite"
              style={styles.title}
            >
              {t('setPassword.successTitle')}
            </Text>

            <Text style={styles.description}>
              {t('setPassword.successDescription')}
            </Text>

            {hasSignOutError && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.error}
              >
                {t('setPassword.signOutError')}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: isSigningOut,
                busy: isSigningOut,
              }}
              disabled={isSigningOut}
              onPress={() => {
                void handleBackToSignIn();
              }}
              style={({ pressed }) => [
                styles.button,
                isSigningOut && styles.buttonDisabled,
                pressed &&
                  !isSigningOut &&
                  styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                {t(
                  isSigningOut
                    ? 'setPassword.signingOut'
                    : 'setPassword.backToSignIn'
                )}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SetPasswordScreen onSubmit={handleSubmit} />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.mist,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
  },
  description: {
    color: colors.charcoal,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  error: {
    color: colors.charcoal,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.md,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neon,
    borderRadius: radii.pill,
    marginTop: spacing.lg,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});