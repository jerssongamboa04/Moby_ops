import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, AppState, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../../theme/tokens';
import { prepareEvidencePhoto, removeLocalPhoto, type EvidencePhoto } from '../lib/evidence-photo';

type Props = { phase: 'before' | 'after'; onCapture: (photo: EvidencePhoto) => void; onClose: () => void };

export function EvidenceCamera({ phase, onCapture, onClose }: Props) {
  const { t } = useTranslation('publicOrder');
  const [permission, request, refresh] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const busyRef = useRef(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', (state) => {
      setActive(state === 'active');
      setReady(false);
      if (state === 'active') void refresh().catch(() => { if (mounted.current) setError(true); });
    });
    return () => { mounted.current = false; sub.remove(); };
  }, [refresh]);

  const capture = async () => {
    if (busyRef.current || !camera.current || !ready || !active) return;
    busyRef.current = true; setBusy(true); setError(false);
    try {
      const raw = await camera.current.takePictureAsync({ quality: 1, exif: false });
      if (!raw) throw new Error('No photo');
      if (!mounted.current) { removeLocalPhoto(raw.uri); return; }
      const photo = await prepareEvidencePhoto(raw);
      if (mounted.current) onCapture(photo);
      else removeLocalPhoto(photo.uri);
    } catch { if (mounted.current) setError(true); }
    finally { busyRef.current = false; if (mounted.current) setBusy(false); }
  };
  const close = () => { if (!busyRef.current) onClose(); };
  return (
    <Modal visible animationType="slide" onRequestClose={close}>
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>{t(phase === 'before' ? 'photos.before' : 'photos.after')}</Text>
        <Text style={styles.help}>{t(phase === 'before' ? 'photos.beforeGuide' : 'photos.afterGuide')}</Text>
        {!permission ? <ActivityIndicator /> : !permission.granted ? (
          <View style={styles.message}>
            <Text style={styles.help}>{t('photos.permission')}</Text>
            <Pressable accessibilityRole="button" style={styles.button} onPress={() => {
              void (permission.canAskAgain ? request() : Linking.openSettings()).catch(() => setError(true));
            }}><Text>{t(permission.canAskAgain ? 'scanner.allow' : 'scanner.settings')}</Text></Pressable>
          </View>
        ) : (
          <View style={styles.preview}>
            {active && <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back"
              onCameraReady={() => setReady(true)} onMountError={() => { setReady(false); setError(true); }} />}
          </View>
        )}
        {error && <Text accessibilityRole="alert" style={styles.help}>{t('photos.error')}</Text>}
        <Pressable accessibilityRole="button" disabled={!ready || !active || busy} style={styles.button}
          onPress={() => { void capture(); }}><Text>{t(busy ? 'photos.processing' : 'photos.capture')}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy} style={styles.close} onPress={close}>
          <Text style={styles.help}>{t('photos.cancel')}</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.charcoal, padding: spacing.lg, gap: spacing.md },
  title: { color: colors.white, fontSize: 24, fontWeight: '700' },
  help: { color: colors.white, fontSize: 16, lineHeight: 23 },
  message: { flex: 1, justifyContent: 'center', gap: spacing.md },
  preview: { flex: 1, overflow: 'hidden', borderRadius: radii.lg },
  button: { minHeight: 56, backgroundColor: colors.neon, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md },
  close: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
