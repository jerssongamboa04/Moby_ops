import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    supportedLanguages,
    type SupportedLanguage,
} from '../../../i18n';
import {
    colors,
    radii,
    spacing,
} from '../../../theme/tokens';

export type SetPasswordScreenProps = {
  onSubmit: (
    password: string
  ) => void | Promise<void>;
};

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function SetPasswordScreen({
  onSubmit,
}: SetPasswordScreenProps) {
  const { t, i18n } = useTranslation('auth');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);
  const [
    isConfirmationVisible,
    setIsConfirmationVisible,
  ] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const submissionInProgress = useRef(false);
  const currentLanguage: SupportedLanguage =
    i18n.language.startsWith('es') ? 'es' : 'en';

  const isFormValid =
    isStrongPassword(password) &&
    password === confirmation;

  const isSubmitDisabled = !isFormValid || isSubmitting;

  const handleSubmit = async (): Promise<void> => {
    if (!isFormValid || submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    setHasSubmitError(false);

    try {
      await onSubmit(password);
    } catch {
      setHasSubmitError(true);
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>MOBY</Text>
            </View>

            <View
              accessibilityLabel={t('languageSelector')}
              style={styles.languageSelector}
            >
              {supportedLanguages.map((option) => {
                const isSelected =
                  currentLanguage === option;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: isSelected,
                    }}
                    key={option}
                    onPress={() => {
                      void i18n.changeLanguage(option);
                    }}
                    style={[
                      styles.languageButton,
                      isSelected &&
                      styles.languageButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        isSelected &&
                        styles.languageTextSelected,
                      ]}
                    >
                      {option.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>
              {t('setPassword.eyebrow')}
            </Text>

            <Text style={styles.title}>
              {t('setPassword.title')}
            </Text>

            <Text style={styles.description}>
              {t('setPassword.description')}
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('setPassword.newPassword.label')}
              </Text>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  accessibilityLabel={t(
                    'setPassword.newPassword.label'
                  )}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                  autoComplete="new-password"
                  onChangeText={setPassword}
                  placeholder={t(
                    'setPassword.newPassword.placeholder'
                  )}
                  placeholderTextColor="#767676"
                  secureTextEntry={!isPasswordVisible}
                  style={[
                    styles.input,
                    styles.passwordInput,
                  ]}
                  textContentType="newPassword"
                  value={password}
                />

                <Pressable
                  accessibilityLabel={t(
                    isPasswordVisible
                      ? 'setPassword.newPassword.hide'
                      : 'setPassword.newPassword.show'
                  )}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {
                    setIsPasswordVisible(
                      (currentValue) => !currentValue
                    );
                  }}
                  style={({ pressed }) => [
                    styles.passwordVisibilityButton,
                    pressed &&
                    styles.passwordVisibilityButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={colors.charcoal}
                    name={
                      isPasswordVisible
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={22}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                {t('setPassword.confirmation.label')}
              </Text>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  accessibilityLabel={t(
                    'setPassword.confirmation.label'
                  )}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                  autoComplete="new-password"
                  onChangeText={setConfirmation}
                  placeholder={t(
                    'setPassword.confirmation.placeholder'
                  )}
                  placeholderTextColor="#767676"
                  secureTextEntry={!isConfirmationVisible}
                  style={[
                    styles.input,
                    styles.passwordInput,
                  ]}
                  textContentType="newPassword"
                  value={confirmation}
                />

                <Pressable
                  accessibilityLabel={t(
                    isConfirmationVisible
                      ? 'setPassword.confirmation.hide'
                      : 'setPassword.confirmation.show'
                  )}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {
                    setIsConfirmationVisible(
                      (currentValue) => !currentValue
                    );
                  }}
                  style={({ pressed }) => [
                    styles.passwordVisibilityButton,
                    pressed &&
                    styles.passwordVisibilityButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={colors.charcoal}
                    name={
                      isConfirmationVisible
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={22}
                  />
                </Pressable>
              </View>
            </View>

            <Text style={styles.requirements}>
              {t('setPassword.requirements')}
            </Text>

            {hasSubmitError && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.requirements}
              >
                {t('setPassword.saveError')}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: isSubmitDisabled,
                busy: isSubmitting,
              }}
              disabled={isSubmitDisabled}
              onPress={() => {
                void handleSubmit();
              }}
              style={({ pressed }) => [
                styles.submitButton,
                isSubmitDisabled && styles.submitButtonDisabled,
                pressed &&
                !isSubmitDisabled &&
                styles.submitButtonPressed,
              ]}
            >
              <Text style={styles.submitText}>
                {t(
                  isSubmitting
                    ? 'setPassword.saving'
                    : 'setPassword.submit'
                )}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    backgroundColor: colors.neon,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  languageSelector: {
    backgroundColor: colors.mist,
    borderRadius: radii.pill,
    flexDirection: 'row',
    padding: spacing.xs,
  },
  languageButton: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  languageButtonSelected: {
    backgroundColor: colors.ink,
  },
  languageText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  languageTextSelected: {
    color: colors.white,
  },
  hero: {
    marginBottom: spacing.xl,
    marginTop: spacing.xxl,
  },
  eyebrow: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.ink,
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 48,
  },
  description: {
    color: colors.charcoal,
    fontSize: 17,
    lineHeight: 25,
    marginTop: spacing.md,
    maxWidth: 340,
  },
  formCard: {
    backgroundColor: colors.white,
    borderColor: colors.mist,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.mist,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  passwordInputContainer: {
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: spacing.xxl + spacing.sm,
  },
  passwordVisibilityButton: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    minWidth: 48,
    position: 'absolute',
    right: spacing.xs,
    top: 0,
  },
  passwordVisibilityButtonPressed: {
    opacity: 0.6,
  },
  requirements: {
    color: colors.charcoal,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.neon,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 56,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonPressed: {
    opacity: 0.75,
  },
  submitText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
});