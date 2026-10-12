import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    colors,
    radii,
    spacing,
} from '../../../theme/tokens';

export type AuthCallbackStatus = 'processing' | 'error';

export type AuthCallbackScreenProps = {
  status: AuthCallbackStatus;
  onBackToSignIn: () => void;
};

export function AuthCallbackScreen({
  status,
  onBackToSignIn,
}: AuthCallbackScreenProps) {
  const { t } = useTranslation('auth');
  const isProcessing = status === 'processing';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {isProcessing && (
            <ActivityIndicator
              accessibilityLabel={t(
                'callback.processingTitle'
              )}
              accessibilityRole="progressbar"
              accessibilityState={{ busy: true }}
              color={colors.ink}
              size="large"
              style={styles.indicator}
            />
          )}

          <Text
            accessibilityRole={
              isProcessing ? 'header' : 'alert'
            }
            accessibilityLiveRegion="polite"
            style={styles.title}
          >
            {t(
              isProcessing
                ? 'callback.processingTitle'
                : 'callback.errorTitle'
            )}
          </Text>

          <Text style={styles.description}>
            {t(
              isProcessing
                ? 'callback.processingDescription'
                : 'callback.errorDescription'
            )}
          </Text>

          {!isProcessing && (
            <Pressable
              accessibilityRole="button"
              onPress={onBackToSignIn}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                {t('callback.backToSignIn')}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  indicator: {
    marginBottom: spacing.lg,
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