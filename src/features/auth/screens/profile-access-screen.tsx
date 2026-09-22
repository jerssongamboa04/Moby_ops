import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../../lib/supabase/client';
import { getOwnProfile } from '../../../lib/supabase/get-own-profile';
import { colors, radii, spacing } from '../../../theme/tokens';
import { OperationsScreen } from '../../operations/screens/operations-screen';

type AccessState =
  | 'loading'
  | 'active'
  | 'inactive'
  | 'missing'
  | 'error';

type ProfileAccessScreenProps = {
  onSignOut: () => Promise<void>;
};

export function ProfileAccessScreen({
  onSignOut,
}: ProfileAccessScreenProps) {
  const { t } = useTranslation('auth');
  const [access, setAccess] = useState<AccessState>('loading');
  const [attempt, setAttempt] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  const signOutInProgress = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadProfile = async (): Promise<void> => {
      try {
        const profile = await getOwnProfile(supabase);

        if (!isCurrent) {
          return;
        }

        if (profile === null) {
          setAccess('missing');
        } else {
          setAccess(profile.is_active ? 'active' : 'inactive');
        }
      } catch {
        if (isCurrent) {
          setAccess('error');
        }
      }
    };

    void loadProfile();

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  const handleSignOut = async (): Promise<void> => {
    if (signOutInProgress.current) {
      return;
    }

    signOutInProgress.current = true;
    setIsSigningOut(true);
    setSignOutError(false);

    try {
      await onSignOut();
    } catch {
      if (isMounted.current) {
        setSignOutError(true);
      }
    } finally {
      signOutInProgress.current = false;

      if (isMounted.current) {
        setIsSigningOut(false);
      }
    }
  };

  if (access === 'active') {
    return <OperationsScreen onSignOut={onSignOut} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {access === 'loading' ? (
        <>
          <ActivityIndicator color={colors.ink} />
          <Text style={styles.description}>
            {t('profileAccess.loading')}
          </Text>
        </>
      ) : (
        <>
          <Text accessibilityRole="header" style={styles.title}>
            {t(`profileAccess.${access}Title`)}
          </Text>

          <Text style={styles.description}>
            {t(`profileAccess.${access}Description`)}
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={isSigningOut}
            accessibilityState={{ disabled: isSigningOut }}
            onPress={() => {
              setAccess('loading');
              setAttempt((value) => value + 1);
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {t('profileAccess.retry')}
            </Text>
          </Pressable>
        </>
      )}

      {signOutError && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.description}
        >
          {t('workspace.signOutError')}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={isSigningOut}
        accessibilityState={{
          disabled: isSigningOut,
          busy: isSigningOut,
        }}
        onPress={() => {
          void handleSignOut();
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {t(
            isSigningOut
              ? 'workspace.signingOut'
              : 'workspace.signOut'
          )}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.paper,
    padding: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800',
  },
  description: {
    color: colors.charcoal,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neon,
    borderRadius: radii.pill,
    minHeight: 56,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
});