import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
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
import { i18n } from '../../../i18n';
import { colors, radii, spacing } from '../../../theme/tokens';

type ProfileScreenProps = {
  onSignOut: () => Promise<void>;
};
export function ProfileScreen({
  onSignOut,
}: ProfileScreenProps) {
  const { t } = useTranslation('auth');
  const { t: tOperations } = useTranslation('operations');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasError, setHasError] = useState(false);
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
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={require('../../../../assets/brand/moby-logo-on-dark.svg')} contentFit="contain" accessibilityLabel="MOBY" style={styles.headerLogo} />
          <Text accessibilityRole="header" style={styles.title}>{tOperations('profile')}</Text>
          <Text style={styles.tagline}>{tOperations('profileTitle')}</Text>
          <View style={styles.taglineAccent} />
        </View>
        <View style={styles.body}>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconTile}><Ionicons name="globe-outline" size={28} color={colors.ink} accessible={false} /></View>
              <View style={styles.headingText}>
                <Text accessibilityRole="header" style={styles.sectionTitle}>{tOperations('preferences')}</Text>
                <Text style={styles.description}>{tOperations('language')}</Text>
              </View>
            </View>
            <View style={styles.languages}>
              {(['en', 'es'] as const).map((language) => {
                const selected = (i18n.resolvedLanguage ?? i18n.language).split('-')[0] === language;
                return (
                  <Pressable
                    key={language}
                    accessibilityRole="button"
                    accessibilityLabel={language === 'en' ? 'English' : 'Español'}
                    accessibilityState={{ selected }}
                    onPress={() => { void i18n.changeLanguage(language); }}
                    style={[styles.language, selected && styles.languageSelected]}
                  >
                    <Text style={styles.languageText}>{language === 'en' ? 'English' : 'Español'}</Text>
                    {selected && <Ionicons name="checkmark" size={22} color={colors.ink} accessible={false} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconTile}><Ionicons name="person-outline" size={28} color={colors.ink} accessible={false} /></View>
              <Text accessibilityRole="header" style={[styles.sectionTitle, styles.headingText]}>{tOperations('account')}</Text>
            </View>
            <View style={styles.divider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(isSigningOut ? 'workspace.signingOut' : 'workspace.signOut')}
              accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
              disabled={isSigningOut}
              onPress={() => { void handleSignOut(); }}
              style={({ pressed }) => [styles.signOut, (pressed || isSigningOut) && styles.dimmed]}
            >
              <Ionicons name="log-out-outline" size={23} color={colors.ink} accessible={false} />
              <Text style={styles.rowLabel}>{t(isSigningOut ? 'workspace.signingOut' : 'workspace.signOut')}</Text>
            </Pressable>
            <Text style={styles.description}>{tOperations('sessionNote')}</Text>
            {hasError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{t('workspace.signOutError')}</Text>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1, paddingBottom: spacing.xl },
  hero: { backgroundColor: '#262626', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 56, gap: spacing.sm },
  headerLogo: { width: 166, height: 30, marginBottom: spacing.sm },
  title: { color: colors.neon, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: '#C3C7CD', fontSize: 16, lineHeight: 24 },
  taglineAccent: { width: 56, height: 3, backgroundColor: colors.neon, marginTop: spacing.xs },
  body: { flex: 1, marginTop: -spacing.lg, backgroundColor: colors.canvas, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg, gap: spacing.lg },
  iconTile: { width: 48, height: 48, backgroundColor: colors.selected, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  headingText: { flex: 1 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  rowLabel: { flex: 1, color: colors.ink, fontSize: 16, fontWeight: '600' },
  languages: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  language: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, flexGrow: 1, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border },
  languageSelected: { backgroundColor: colors.selected, borderColor: colors.neon },
  languageText: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  signOut: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, padding: spacing.sm },
  dimmed: { opacity: 0.6 },
  error: { color: colors.danger, fontSize: 15, lineHeight: 22, marginTop: spacing.md },
});
