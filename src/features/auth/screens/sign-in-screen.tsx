import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
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
    useWindowDimensions,
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
    const { width } = useWindowDimensions();
    const canvasWidth = Math.min(width, 520);
    const titleSize = Math.min(44, Math.max(28, canvasWidth * 0.092));
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.brandRow}>
                        <View style={styles.logo}>
                            <Image source={require('../../../../assets/brand/moby-logo-on-light.svg')} accessibilityLabel="MOBY" contentFit="contain" style={styles.logoImage} />
                        </View>

                        <View
                            accessibilityLabel={t('languageSelector')}
                            style={styles.languageSelector}
                        >
                            <View pointerEvents="none" style={styles.languageTrack} />
                            {supportedLanguages.map((option) => {
                                const isSelected = currentLanguage === option;

                                return (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isSelected }}
                                        accessibilityLabel={option.toUpperCase()}
                                        key={option}
                                        onPress={() => {
                                            void i18n.changeLanguage(option);
                                        }}
                                        style={styles.languageButton}
                                    >
                                        <View style={[styles.languagePill, isSelected && styles.languageButtonSelected]}>
                                            <Text style={[styles.languageText, isSelected && styles.languageTextSelected]}>
                                                {option.toUpperCase()}
                                            </Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={[styles.hero, { minHeight: canvasWidth * 350 / 444 }]}>
                        <Image source={require('../../../../assets/brand/dublin-motion.svg')}
                            contentFit="fill" accessible={false} pointerEvents="none"
                            style={[styles.cityIllustration, { height: canvasWidth * 350 / 444 }]} />
                        <View accessible accessibilityRole="header" accessibilityLabel={t('title')}>
                            <View style={styles.titleLine}>
                                <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.12 }]}>{t('titleLead')} </Text>
                                <View style={styles.cityWord}>
                                    <View style={styles.titleAccent} />
                                    <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.12 }]}>{t('titleCity')}</Text>
                                </View>
                            </View>
                            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.12 }]}>{t('titleEnd')}</Text>
                        </View>
                        <Text style={styles.description}>{t('description')}</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text accessibilityRole="header" style={styles.formTitle}>{t('signIn')}</Text>
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

                        <Text style={styles.label}>{t('password.label')}</Text>
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
                            onPress={() => router.push('/auth/forgot-password')}
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
                            accessibilityLabel={t(isSubmitting ? 'signingIn' : 'signIn')}
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
                            <View style={styles.submitArrow}><Ionicons name="arrow-forward" size={24} color={colors.ink} accessible={false} /></View>
                        </Pressable>

                        <Text style={styles.helper}>MOBY Ops</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FAFAF8' },
    keyboardView: { flex: 1 },
    content: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xl, maxWidth: 520, width: '100%', alignSelf: 'center' },
    brandRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
    logo: { width: 136 },
    logoImage: { width: 166, height: 30, marginBottom: spacing.sm },
    ops: { color: colors.ink, fontSize: 10, fontWeight: '800', letterSpacing: 3, alignSelf: 'flex-end', marginRight: spacing.sm, marginTop: spacing.xs },
    languageSelector: { flexDirection: 'row', borderRadius: radii.pill, alignItems: 'center' },
    // Keep 44pt touch targets while the visible pills stay slim like the reference.
    languageTrack: { position: 'absolute', top: 7, bottom: 7, left: 0, right: 0, borderRadius: radii.pill, borderWidth: 0.5, borderColor: '#8D9092', backgroundColor: '#F5F5F2' },
    languageButton: { minHeight: 44, width: 44, justifyContent: 'center', alignItems: 'center' },
    languagePill: { minHeight: 30, width: 44, borderRadius: 15, overflow: 'hidden', paddingVertical: 5, justifyContent: 'center', alignItems: 'center' },
    languageButtonSelected: { backgroundColor: '#252525' },
    languageText: { color: '#55575C', fontSize: 12, fontWeight: '500' },
    languageTextSelected: { color: colors.white },
    hero: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg, paddingTop: 22, paddingBottom: 160, marginTop: 26, marginBottom: spacing.lg },
    titleLine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
    title: { color: '#0B1017', fontWeight: '900', letterSpacing: -1.3 },
    cityWord: { alignSelf: 'flex-start' },
    titleAccent: { position: 'absolute', bottom: 2, left: 0, right: 0, height: 7, backgroundColor: colors.neon },
    description: { color: '#55575F', fontSize: 15, lineHeight: 23, marginTop: 14 },
    cityIllustration: { position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%' },
    formCard: { width: '100%' },
    formTitle: { color: colors.ink, fontSize: 24, fontWeight: '800', marginBottom: spacing.lg },
    field: { marginBottom: spacing.md },
    label: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: spacing.sm },
    input: { backgroundColor: colors.white, borderColor: '#B9BCC0', borderRadius: radii.sm, borderWidth: 1, color: colors.ink, fontSize: 16, minHeight: 54, paddingHorizontal: spacing.md, paddingVertical: 12 },
    forgotButton: { alignSelf: 'flex-end', marginBottom: spacing.md, marginTop: spacing.xs, paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
    forgotText: { color: colors.muted, fontSize: 14, textDecorationLine: 'underline' },
    signInButton: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, backgroundColor: colors.charcoal, borderRadius: radii.lg, justifyContent: 'space-between', minHeight: 64, padding: 10, paddingLeft: spacing.lg },
    signInButtonDisabled: { opacity: 0.45 },
    signInButtonPressed: { opacity: 0.75 },
    signInText: { flex: 1, color: colors.white, fontSize: 18, fontWeight: '800' },
    submitArrow: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.neon, alignItems: 'center', justifyContent: 'center' },
    helper: { color: colors.muted, fontSize: 10, letterSpacing: 2, marginTop: spacing.lg, textAlign: 'center' },
    passwordInputContainer: { justifyContent: 'center' },
    passwordInput: { paddingRight: spacing.xxl + spacing.sm },
    passwordVisibilityButton: { alignItems: 'center', bottom: 0, justifyContent: 'center', minWidth: 48, position: 'absolute', right: spacing.xs, top: 0 },
    passwordVisibilityButtonPressed: { opacity: 0.6 },
    submitError: { color: colors.danger, fontSize: 14, lineHeight: 21, marginBottom: spacing.md },
});
