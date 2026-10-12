import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult, type BarcodeType } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, AppState, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../../../theme/tokens';

import { parseBicycleScan } from '../lib/bicycle-id';

// Both printed barcodes and the operational MOBY QR are supported.
const barcodeTypes: BarcodeType[] = [
  'qr', 'code128', 'code39', 'code93', 'ean13', 'ean8',
  'upc_a', 'upc_e', 'itf14', 'codabar',
];

type BicycleScannerProps = {
  onScanned: (code: string) => void;
  onClose: () => void;
};

export function BicycleScanner({ onScanned, onClose }: BicycleScannerProps) {
  const { t } = useTranslation('publicOrder');
  const [permission, requestPermission, refreshPermission] = useCameraPermissions();
  const [appState, setAppState] = useState(AppState.currentState);
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [torch, setTorch] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);
  const handled = useRef(false);
  const requesting = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const subscription = AppState.addEventListener('change', (next) => {
      setAppState(next);
      if (next !== 'active') setTorch(false);
      else {
        void refreshPermission().catch(() => {
          if (mounted.current) setRequestError(true);
        });
      }
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [refreshPermission]);

  const handlePermission = async () => {
    if (requesting.current) return;
    requesting.current = true;
    setBusy(true);
    setRequestError(false);
    try {
      if (permission?.canAskAgain === false) await Linking.openSettings();
      else await requestPermission();
    } catch {
      if (mounted.current) setRequestError(true);
    } finally {
      requesting.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const handleScan = ({ data, type }: BarcodeScanningResult) => {
    if (handled.current || appState !== 'active' || cameraError || !permission?.granted) return;
    if (!barcodeTypes.includes(type as BarcodeType)) return;
    const id = parseBicycleScan(data, type);
    if (id === null) {
      setInvalidCode(true);
      return;
    }
    handled.current = true;
    onScanned(id);
    // Feedback is optional: it must never block a successfully read ID.
    void (async () => {
      try {
        if (Platform.OS === 'android') {
          await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {
        // Device settings or missing hardware may prevent haptic feedback.
      }
    })();
  };

  const handleClose = () => {
    handled.current = true;
    onClose();
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>{t('scanner.title')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('scanner.close')} onPress={handleClose} style={styles.close}>
            <Ionicons name="close" size={27} color={colors.white} />
          </Pressable>
        </View>
        {permission === null ? (
          <View style={styles.message}><ActivityIndicator color={colors.neon} accessibilityLabel={t('scanner.loading')} /></View>
        ) : !permission.granted ? (
          <ScrollView contentContainerStyle={styles.message}>
            <Ionicons name="camera-outline" size={48} color={colors.neon} />
            <Text style={styles.body}>{t('scanner.permission')}</Text>
            <Pressable accessibilityRole="button" disabled={busy} accessibilityState={{ disabled: busy, busy }} onPress={() => { void handlePermission(); }} style={styles.primary}>
              <Text style={styles.primaryText}>{t(permission.canAskAgain ? 'scanner.allow' : 'scanner.settings')}</Text>
            </Pressable>
            {requestError && <Text accessibilityRole="alert" style={styles.body}>{t('scanner.permissionError')}</Text>}
          </ScrollView>
        ) : cameraError ? (
          <View style={styles.message}><Text accessibilityRole="alert" style={styles.body}>{t('scanner.cameraError')}</Text></View>
        ) : (
          <View style={styles.preview}>
            {appState === 'active' && (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={torch}
                barcodeScannerSettings={{ barcodeTypes }}
                onBarcodeScanned={handleScan}
                onMountError={() => setCameraError(true)}
              />
            )}
            <View pointerEvents="none" style={styles.guide}>
              <View style={styles.frame} />
              <Text style={styles.guideText}>{t('scanner.guide')}</Text>
            </View>
          </View>
        )}
        <View style={styles.footer}>
          {invalidCode && <Text accessibilityRole="alert" style={styles.body}>{t('scanner.invalidCode')}</Text>}
          {permission?.granted && !cameraError && (
            <Pressable accessibilityRole="button" accessibilityLabel={t(torch ? 'scanner.torchOff' : 'scanner.torchOn')} accessibilityState={{ selected: torch }} onPress={() => setTorch((value) => !value)} style={styles.secondary}>
              <Ionicons name={torch ? 'flash' : 'flash-outline'} size={22} color={colors.neon} />
              <Text style={styles.secondaryText}>{t(torch ? 'scanner.torchOff' : 'scanner.torchOn')}</Text>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" onPress={handleClose} style={styles.secondary}>
            <Text style={styles.secondaryText}>{t('scanner.manual')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md },
  title: { flex: 1, color: colors.white, fontSize: 23, fontWeight: '800' },
  close: { width: 48, height: 56, alignItems: 'center', justifyContent: 'center' },
  preview: { flex: 1, overflow: 'hidden', margin: spacing.md, borderRadius: radii.lg },
  guide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },
  frame: { width: '100%', height: 130, borderWidth: 3, borderColor: colors.neon, borderRadius: radii.md },
  guideText: { backgroundColor: colors.ink, color: colors.white, padding: spacing.md, borderRadius: radii.sm, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  message: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },
  body: { color: colors.white, fontSize: 17, lineHeight: 26, textAlign: 'center' },
  primary: { backgroundColor: colors.neon, minHeight: 56, justifyContent: 'center', padding: spacing.md, borderRadius: radii.pill },
  primaryText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.xs },
  secondary: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  secondaryText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
