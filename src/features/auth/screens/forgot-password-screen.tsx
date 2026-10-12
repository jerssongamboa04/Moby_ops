import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../../theme/tokens';

export function ForgotPasswordScreen({ onSubmit, onBack }: {
  onSubmit: (email: string) => Promise<void>; onBack: () => void;
}) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [remaining, setRemaining] = useState(0);
  const active = useRef(false);
  const busy = useRef(false);
  const nextAllowed = useRef(0);
  useEffect(() => {
    active.current = true;
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((nextAllowed.current - Date.now()) / 1000))), 1000);
    return () => { active.current = false; clearInterval(timer); };
  }, []);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const disabled = !valid || status === 'sending' || remaining > 0;
  const submit = async () => {
    if (!valid || busy.current || Date.now() < nextAllowed.current) return;
    busy.current = true;
    setStatus('sending');
    // Local UX throttle; Supabase remains responsible for actual rate limits.
    nextAllowed.current = Date.now() + 60000;
    setRemaining(60);
    try {
      await onSubmit(email.trim());
      if (active.current) setStatus('sent');
    } catch {
      if (active.current) setStatus('error');
    } finally { busy.current = false; }
  };
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image source={require('../../../../assets/brand/moby-logo-on-light.svg')} accessibilityLabel="MOBY" contentFit="contain" style={styles.logo} />
        <Text accessibilityRole="header" style={styles.title}>{t('recovery.title')}</Text>
        <Text style={styles.description}>{t('recovery.description')}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t('email.label')}</Text>
          <TextInput accessibilityLabel={t('email.label')} placeholder={t('email.placeholder')} placeholderTextColor={colors.muted}
            value={email} onChangeText={(value) => { setEmail(value); setStatus('idle'); }} editable={status !== 'sending'}
            autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" style={styles.input} />
          {status === 'sent' && <Text accessibilityLiveRegion="polite" style={styles.message}>{t('recovery.sent')}</Text>}
          {status === 'error' && <Text accessibilityRole="alert" style={styles.error}>{t('recovery.error')}</Text>}
          <Pressable accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled, busy: status === 'sending' }}
            onPress={() => { void submit(); }} style={[styles.button, disabled && styles.disabled]}>
            <Text style={styles.buttonText}>{t(status === 'sending' ? 'recovery.sending' : 'recovery.send')}</Text>
          </Pressable>
          {remaining > 0 && status !== 'sending' && <Text style={styles.description}>{t('recovery.wait', { seconds: remaining })}</Text>}
        </View>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}><Text style={styles.label}>{t('setPassword.backToSignIn')}</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, flex: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 520, alignSelf: 'center' },
  logo: { width: 166, height: 30, marginBottom: spacing.lg },
  title: { color: colors.ink, fontSize: 32, fontWeight: '800' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: { padding: spacing.md, borderRadius: radii.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  label: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  input: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, padding: spacing.md, color: colors.ink, fontSize: 16 },
  message: { color: colors.ink, backgroundColor: colors.selected, borderRadius: radii.sm, padding: spacing.md, lineHeight: 22 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 22 },
  button: { minHeight: 54, backgroundColor: colors.charcoal, borderRadius: radii.sm, padding: spacing.md, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.45 }, back: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
