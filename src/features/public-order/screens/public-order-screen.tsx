import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { File } from 'expo-file-system';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isValidBicycleId, normalizeBicycleId } from '../lib/bicycle-id';
import { BicycleScanner } from '../components/bicycle-scanner';
import { EvidenceCamera } from '../components/evidence-camera';
import { removeLocalPhoto, type EvidencePhoto } from '../lib/evidence-photo';
import { supabase } from '../../../lib/supabase/client';
import { preparePublicOrder, submitPublicOrder, type UploadTicket, type PublicOrderPayload } from '../../../lib/supabase/submit-public-order';
import { colors, radii, spacing } from '../../../theme/tokens';

const actionKeys = [
  'kickstandPositioned',
  'bikeLocked',
  'bikeRepositioned',
] as const;

type ActionKey = (typeof actionKeys)[number];

function StepHeading({ number, icon, title }: {
  number: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
}) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={`${number}. ${title}`} style={styles.sectionHeading}>
      <View style={styles.stepBadge}><Text style={styles.stepNumber}>{number}</Text></View>
      <Ionicons name={icon} size={25} color={colors.ink} accessible={false} />
      <Text style={styles.label}>{title}</Text>
    </View>
  );
}

export function PublicOrderScreen() {
  const { t } = useTranslation('publicOrder');
  const [focusedField, setFocusedField] = useState<'bikeId' | 'notes' | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [bikeIdTouched, setBikeIdTouched] = useState(false);
  const [bikeId, setBikeId] = useState('');
  const [notes, setNotes] = useState('');
  const [actions, setActions] = useState<Record<ActionKey, boolean>>({
    kickstandPositioned: false,
    bikeLocked: false,
    bikeRepositioned: false,
  });

  const [photos, setPhotos] = useState<Partial<Record<'before' | 'after', EvidencePhoto>>>({});
  const photosRef = useRef(photos);
  const [photoPhase, setPhotoPhase] = useState<'before' | 'after' | null>(null);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!sent) return;
    const timeout = setTimeout(() => setSent(false), 5000);
    return () => clearTimeout(timeout);
  }, [sent]);
  const ticket = useRef<UploadTicket | null>(null);
  const payload = useRef<PublicOrderPayload | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const photo of Object.values(photosRef.current)) if (photo) removeLocalPhoto(photo.uri);
    };
  }, []);
  const replacePhotos = (next: typeof photos) => {
    photosRef.current = next;
    setPhotos(next);
  };
  const canSend = isValidBicycleId(normalizeBicycleId(bikeId)) &&
    actionKeys.some((key) => actions[key]) && !!photos.before && !!photos.after;
  const submit = async () => {
    if (sendingRef.current || !canSend) return;
    sendingRef.current = true; setSending(true); setPending(true); setSendError(false); setSent(false);
    try {
      if (!payload.current) {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) throw new Error('Location required');
        let timer: ReturnType<typeof setTimeout> | undefined;
        const position = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
          new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Location timeout')), 20000); }),
        ]).finally(() => { if (timer) clearTimeout(timer); });
        payload.current = {
          bikeId: normalizeBicycleId(bikeId), kickstand: actions.kickstandPositioned,
          locked: actions.bikeLocked, repositioned: actions.bikeRepositioned, notes,
          latitude: position.coords.latitude, longitude: position.coords.longitude,
          performedAt: new Date().toISOString(), beforeCapturedAt: photos.before!.capturedAt,
          afterCapturedAt: photos.after!.capturedAt,
        };
      }
      if (!mounted.current) return;
      if (!ticket.current) ticket.current = await preparePublicOrder(supabase);
      if (!mounted.current) return;
      await submitPublicOrder(supabase, ticket.current, payload.current, async (phase) => {
        return new File(photosRef.current[phase]!.uri).arrayBuffer();
      });
      if (!mounted.current) return;
      for (const photo of Object.values(photosRef.current)) if (photo) removeLocalPhoto(photo.uri);
      replacePhotos({}); setBikeId(''); setBikeIdTouched(false); setNotes('');
      setActions({ kickstandPositioned: false, bikeLocked: false, bikeRepositioned: false });
      ticket.current = null; payload.current = null; setPending(false); setSent(true);
    } catch {
      if (mounted.current) {
        setSendError(true);
        if (!ticket.current) { payload.current = null; setPending(false); }
      }
    }
    finally { sendingRef.current = false; if (mounted.current) setSending(false); }
  };
  const review = () => {
    if (pending) { void submit(); return; }
    Alert.alert(t('send.review'), [normalizeBicycleId(bikeId),
      ...actionKeys.filter((key) => actions[key]).map((key) => t(key)), t('send.twoPhotos')].join('\n'),
      [{ text: t('keepEditing'), style: 'cancel' }, { text: t('send.confirm'), onPress: () => { void submit(); } }]);
  };

  const showBikeIdError = bikeIdTouched && focusedField !== 'bikeId' && !isValidBicycleId(normalizeBicycleId(bikeId));

  const hasChanges =
    !!photos.before || !!photos.after || bikeId.length > 0 ||
    notes.length > 0 ||
    actionKeys.some((key) => actions[key]);

  const handleDiscard = () => {
    if (!hasChanges || pending) {
      return;
    }

    Alert.alert(
      t('discardTitle'),
      t('discardDescription'),
      [
        {
          text: t('keepEditing'),
          style: 'cancel',
        },
        {
          text: t('discard'),
          style: 'destructive',
          onPress: () => {
            for (const photo of Object.values(photosRef.current)) if (photo) removeLocalPhoto(photo.uri);
            replacePhotos({});
            setBikeId('');
            setBikeIdTouched(false);
            setNotes('');
            setActions({
              kickstandPositioned: false,
              bikeLocked: false,
              bikeRepositioned: false,
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderPhotoStep = (phase: 'before' | 'after') => {
    const disabled = pending || (phase === 'after' && !photos.before);
    return (
      <View style={styles.card}>
        <StepHeading number={phase === 'before' ? 2 : 4} icon="camera-outline" title={t(phase === 'before' ? 'steps.before' : 'steps.after')} />
        <Pressable accessibilityRole="button" accessibilityLabel={t(phase === 'before' ? 'photos.before' : 'photos.after')}
          accessibilityState={{ disabled }} disabled={disabled} style={[styles.photoTile, disabled && styles.disabled]}
          onPress={() => { Keyboard.dismiss(); setPhotoPhase(phase); }}>
          {photos[phase] ? <Image source={{ uri: photos[phase]!.uri }} style={styles.thumbnail} contentFit="cover" /> :
            <Ionicons name="camera-outline" size={32} color={colors.charcoal} />}
          <Text style={styles.photoLabel}>{t(photos[phase] ? 'photos.retake' : 'photos.add')}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View testID="public-order-heading" style={styles.heading}>
            <Image source={require('../../../../assets/brand/moby-logo-on-dark.svg')} contentFit="contain" accessibilityLabel="MOBY" style={styles.headerLogo} />
            <Text accessibilityRole="header" style={styles.title}>{t('title')}</Text>
            <Text style={styles.tagline}>{t('tagline')}</Text>
            <View style={styles.taglineAccent} />
          </View>

          <View style={styles.form}>

          <View testID="bicycle-id-section" style={styles.card}>
            <StepHeading number={1} icon="bicycle-outline" title={t('steps.identify')} />
            <Text style={styles.fieldLabel}>{t('bikeId')}</Text>
            <View style={styles.bikeInputRow}>
            <TextInput
              accessibilityLabel={t('bikeId')}
              editable={!pending}
              value={bikeId}
              onChangeText={setBikeId}
              placeholder={t('bikeIdPlaceholder')}
              placeholderTextColor={colors.muted}
              autoCorrect={false}
              autoCapitalize="characters"
              onFocus={() => setFocusedField('bikeId')}
              onBlur={() => { setFocusedField(null); setBikeId(normalizeBicycleId(bikeId)); setBikeIdTouched(true); }}
              style={[styles.input, styles.bikeInput, focusedField === 'bikeId' && styles.inputFocused, showBikeIdError && styles.inputError]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('scan')}
              disabled={pending}
              onPress={() => { Keyboard.dismiss(); setScannerOpen(true); }}
              style={({ pressed }) => [styles.scanButton, pressed && styles.pressed]}
            >
              <Ionicons name="barcode-outline" size={26} color={colors.ink} />
              <Text style={styles.scanText}>{t('scanShort')}</Text>
            </Pressable>
            </View>
            {showBikeIdError && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} accessible={false} />
                <Text accessibilityRole="alert" style={styles.fieldError}>{t('invalidBikeId')}</Text>
              </View>
            )}
          </View>

          {renderPhotoStep('before')}

          <View style={styles.card}>
            <StepHeading number={3} icon="checkmark-done-outline" title={t('actions')} />
            <Text style={styles.hint}>{t('actionsHint')}</Text>
            <View style={styles.actions}>
              {actionKeys.map((key) => (
                <Pressable
                  key={key}
                  accessibilityRole="checkbox"
                  disabled={pending}
                  accessibilityLabel={t(key)}
                  accessibilityState={{ checked: actions[key] }}
                  onPress={() => setActions((current) => ({ ...current, [key]: !current[key] }))}
                  style={({ pressed }) => [styles.action, actions[key] && styles.actionSelected, pressed && styles.pressed]}
                >
                  <Ionicons
                    name={key === 'bikeLocked' ? 'lock-closed-outline' : key === 'bikeRepositioned' ? 'move-outline' : 'bicycle-outline'}
                    size={23}
                    color={colors.charcoal}
                    accessible={false}
                  />
                  <Text style={styles.actionText}>{t(key)}</Text>
                  <View accessible={false} style={[styles.checkbox, actions[key] && styles.checkboxSelected]}>
                    {actions[key] && <Ionicons name="checkmark" size={18} color={colors.ink} />}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>


          {renderPhotoStep('after')}

          <View style={styles.card}>
            <StepHeading number={5} icon="paper-plane-outline" title={t('steps.review')} />
            <Text style={styles.fieldLabel}>{t('notes')}</Text>
            <TextInput
              accessibilityLabel={t('notes')}
              editable={!pending}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('notesPlaceholder')}
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              onFocus={() => setFocusedField('notes')}
              onBlur={() => setFocusedField(null)}
              style={[styles.input, styles.notes, focusedField === 'notes' && styles.inputFocused]}
            />
          {sendError && <Text accessibilityRole="alert" style={styles.fieldError}>{t('send.error')}</Text>}
          {pending && <Text style={styles.hint}>{t('send.pending')}</Text>}
          {sent && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.success}>{t('send.success')}</Text>}
          <Pressable accessibilityRole="button" accessibilityLabel={t(sending ? 'send.sending' : pending ? 'send.retry' : 'send.review')} disabled={!canSend || sending} onPress={review}
            style={[styles.submitButton, (!canSend || sending) && styles.disabled]}>
            <Ionicons name="paper-plane-outline" size={23} color={colors.ink} accessible={false} />
            <Text style={styles.submitLabel}>{t(sending ? 'send.sending' : pending ? 'send.retry' : 'send.review')}</Text>
          </Pressable>
          <Text style={styles.hint}>{t('send.requirements')}</Text>
          {hasChanges && !pending && (
            <Pressable accessibilityRole="button" accessibilityLabel={t('discardDraft')} onPress={handleDiscard} style={styles.discardButton}>
              <Ionicons name="trash-outline" size={18} color={colors.muted} />
              <Text style={styles.discardText}>{t('discardDraft')}</Text>
            </Pressable>
          )}
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {photoPhase && <EvidenceCamera phase={photoPhase} onClose={() => setPhotoPhase(null)} onCapture={(photo) => {
        const old = photosRef.current[photoPhase];
        if (old) removeLocalPhoto(old.uri);
        const next = { ...photosRef.current, [photoPhase]: photo };
        // Retaking the initial state requires new final-state evidence.
        if (photoPhase === 'before' && next.after) { removeLocalPhoto(next.after.uri); delete next.after; }
        replacePhotos(next); setPhotoPhase(null);
      }} />}
      {scannerOpen && (
        <BicycleScanner
          onClose={() => setScannerOpen(false)}
          onScanned={(code) => { setBikeId(code); setScannerOpen(false); }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  container: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  heading: { backgroundColor: '#262626', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 56, gap: spacing.sm },
  headerLogo: { width: 166, height: 30, marginBottom: spacing.sm },
  title: { color: colors.neon, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: '#C3C7CD', fontSize: 16, lineHeight: 24 },
  taglineAccent: { width: 56, height: 3, backgroundColor: colors.neon, marginTop: spacing.xs },
  form: { marginTop: -spacing.lg, backgroundColor: colors.white, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg, gap: spacing.lg },
  card: { gap: spacing.sm },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs, backgroundColor: colors.selected, borderLeftWidth: 4, borderLeftColor: colors.neon, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 12 },
  stepBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.neon, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { fontSize: 19, fontWeight: '800', color: colors.ink },
  fieldLabel: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  bikeInputRow: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm },
  bikeInput: { flex: 1, minWidth: 0, fontSize: 15, paddingHorizontal: spacing.sm },
  scanButton: { minWidth: 72, minHeight: 64, padding: spacing.sm, borderRadius: radii.sm, backgroundColor: colors.neon, justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  scanText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  label: { flexShrink: 1, color: colors.ink, fontSize: 17, fontWeight: '700' },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  inputError: { borderColor: colors.danger },
  fieldError: { flex: 1, color: colors.danger, fontSize: 14, lineHeight: 20 },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: spacing.xs },
  input: { minHeight: 56, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, backgroundColor: colors.paper, color: colors.ink, fontSize: 16, padding: spacing.md },
  inputFocused: { borderColor: colors.ink, backgroundColor: colors.white },
  actions: { gap: spacing.sm },
  action: { flexDirection: 'row', alignItems: 'center', minHeight: 60, padding: spacing.sm + spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, gap: spacing.sm + spacing.xs },
  actionSelected: { backgroundColor: colors.selected, borderColor: colors.ink },
  actionText: { flex: 1, color: colors.ink, fontSize: 16, fontWeight: '600' },
  checkbox: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.muted, borderRadius: 8 },
  checkboxSelected: { backgroundColor: colors.neon, borderColor: colors.ink },
  pressed: { opacity: 0.7 },
  notes: { minHeight: 96 },
  photoTile: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, minHeight: 140, backgroundColor: colors.canvas, borderRadius: radii.md, padding: spacing.sm, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  thumbnail: { width: '100%', height: 140, borderRadius: radii.sm },
  photoLabel: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  submitButton: { backgroundColor: colors.neon, borderRadius: radii.md, minHeight: 56, flexDirection: 'row', gap: spacing.sm, padding: spacing.sm, justifyContent: 'center', alignItems: 'center' },
  submitLabel: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  success: { color: colors.ink, backgroundColor: colors.selected, padding: spacing.md, borderRadius: radii.md },
  discardButton: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.md },
  discardText: { color: colors.muted, fontSize: 15, fontWeight: '600' },
});
