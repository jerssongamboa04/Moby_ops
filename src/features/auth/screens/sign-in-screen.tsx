import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
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
import { colors, radii, spacing } from '../../../theme/tokens';

type SignInScreenProps = {
    onSubmit: (email: string, password: string) => Promise<void>;
};

export function SignInScreen({ onSubmit }: SignInScreenProps) {
    const { t, i18n } = useTranslation('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const currentLanguage: SupportedLanguage =
        i18n.language.startsWith('es') ? 'es' : 'en';

    const isFormComplete = email.trim().length > 0 && password.length > 0;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitError, setHasSubmitError] = useState(false);

    const submitInProgress = useRef(false);
    const isMounted = useRef(false);
    const canSubmit = isFormComplete && !isSubmitting;

    const handleSubmit = async (): Promise<void> => {
        if (!isFormComplete || submitInProgress.current) {
            return;
        }

        submitInProgress.current = true;
        setIsSubmitting(true);
        setHasSubmitError(false);

        try {
            await onSubmit(email, password);

            if (isMounted.current) {
                setPassword('');
            }
        } catch {
            if (isMounted.current) {
                setHasSubmitError(true);
            }
        } finally {
            submitInProgress.current = false;

            if (isMounted.current) {
                setIsSubmitting(false);
            }
        }
    };
    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                                const isSelected = currentLanguage === option;

                                return (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isSelected }}
                                        key={option}
                                        onPress={() => {
                                            void i18n.changeLanguage(option);
                                        }}
                                        style={[
                                            styles.languageButton,
                                            isSelected && styles.languageButtonSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.languageText,
                                                isSelected && styles.languageTextSelected,
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
                        <Text style={styles.eyebrow}>{t('eyebrow')}</Text>
                        <Text style={styles.title}>{t('title')}</Text>
                        <Text style={styles.description}>{t('description')}</Text>
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.field}>
                            <Text style={styles.label}>{t('email.label')}</Text>
                            <TextInput
                                accessibilityLabel={t('email.label')}
                                autoCapitalize="none"
                                autoComplete="email"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                placeholder={t('email.placeholder')}
                                placeholderTextColor="#767676"
                                style={styles.input}
                                textContentType="emailAddress"
                                value={email}
                                editable={!isSubmitting}
                            />
                        </View>

                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                accessibilityLabel={t('password.label')}
                                autoCapitalize="none"
                                autoComplete="current-password"
                                onChangeText={setPassword}
                                placeholder={t('password.placeholder')}
                                placeholderTextColor="#767676"
                                secureTextEntry={!isPasswordVisible}
                                style={[styles.input, styles.passwordInput]}
                                textContentType="password"
                                value={password}
                                editable={!isSubmitting}
                            />

                            <Pressable
                                accessibilityLabel={t(
                                    isPasswordVisible ? 'password.hide' : 'password.show'
                                )}
                                accessibilityRole="button"
                                hitSlop={8}
                                onPress={() => {
                                    setIsPasswordVisible((currentValue) => !currentValue);
                                }}
                                style={({ pressed }) => [
                                    styles.passwordVisibilityButton,
                                    pressed && styles.passwordVisibilityButtonPressed,
                                ]}
                            >
                                <Ionicons
                                    color={colors.charcoal}
                                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                />
                            </Pressable>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => undefined}
                            style={styles.forgotButton}
                        >
                            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
                        </Pressable>

                        {hasSubmitError && (
                            <Text
                                accessibilityRole="alert"
                                accessibilityLiveRegion="polite"
                                style={styles.submitError}
                            >
                                {t('signInError')}
                            </Text>
                        )}

                        <Pressable
                            accessibilityRole="button"
                            accessibilityState={{
                                disabled: !canSubmit,
                                busy: isSubmitting,
                            }}
                            disabled={!canSubmit}
                            onPress={() => {
                                void handleSubmit();
                            }}
                            style={({ pressed }) => [
                                styles.signInButton,
                                !canSubmit && styles.signInButtonDisabled,
                                pressed && canSubmit && styles.signInButtonPressed,
                            ]}
                        >
                            <Text style={styles.signInText}>
                                {t(isSubmitting ? 'signingIn' : 'signIn')}
                            </Text>
                        </Pressable>

                        <Text style={styles.helper}>{t('helper')}</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.paper,
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
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
        marginTop: spacing.sm,
        paddingVertical: spacing.sm,
    },
    forgotText: {
        color: colors.ink,
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    signInButton: {
        alignItems: 'center',
        backgroundColor: colors.neon,
        borderRadius: radii.pill,
        justifyContent: 'center',
        minHeight: 56,
    },
    signInButtonDisabled: {
        opacity: 0.45,
    },
    signInButtonPressed: {
        opacity: 0.75,
    },
    signInText: {
        color: colors.ink,
        fontSize: 16,
        fontWeight: '800',
    },
    helper: {
        color: colors.charcoal,
        fontSize: 13,
        lineHeight: 19,
        marginTop: spacing.md,
        textAlign: 'center',
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
    submitError: {
        color: colors.charcoal,
        fontSize: 14,
        lineHeight: 21,
        marginBottom: spacing.md,
    },

});