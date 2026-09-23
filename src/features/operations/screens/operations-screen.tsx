import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../../theme/tokens';
import { PublicOrderScreen } from '../../public-order/screens/public-order-screen';
type OperationsScreenProps = {
  onSignOut: () => Promise<void>;
};
export function OperationsScreen({
  onSignOut,
}: OperationsScreenProps) {
  const { t } = useTranslation('auth');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { t: tPublicOrder } = useTranslation('publicOrder');
  const [isCreatingAction, setIsCreatingAction] = useState(false);
  const signOutInProgress = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSignOut = async (): Promise<void> => {
    if (signOutInProgress.current) {
      return;
    }

    signOutInProgress.current = true;
    setIsSigningOut(true);
    setHasError(false);

    try {
      await onSignOut();
    } catch {
      if (isMounted.current) {
        setHasError(true);
      }
    } finally {
      signOutInProgress.current = false;

      if (isMounted.current) {
        setIsSigningOut(false);
      }
    }
  };
  if (isCreatingAction) {
    return (
      <PublicOrderScreen
        onBack={() => setIsCreatingAction(false)}
      />
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {t('workspace.title')}
        </Text>

        <Text style={styles.description}>
          {t('workspace.description')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSigningOut }}
          disabled={isSigningOut}
          onPress={() => setIsCreatingAction(true)}
          style={({ pressed }) => [
            styles.button,
            (pressed || isSigningOut) && styles.buttonDimmed,
          ]}
        >
          <Text style={styles.buttonText}>
            {tPublicOrder('start')}
          </Text>
        </Pressable>
        {hasError && (
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
          accessibilityState={{
            disabled: isSigningOut,
            busy: isSigningOut,
          }}
          disabled={isSigningOut}
          onPress={() => {
            void handleSignOut();
          }}
          style={({ pressed }) => [
            styles.button,
            (pressed || isSigningOut) && styles.buttonDimmed,
          ]}
        >
          <Text style={styles.buttonText}>
            {t(
              isSigningOut
                ? 'workspace.signingOut'
                : 'workspace.signOut'
            )}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
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
  buttonDimmed: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
});