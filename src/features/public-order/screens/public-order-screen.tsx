import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    BackHandler,
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

import { colors, radii, spacing } from '../../../theme/tokens';

type PublicOrderScreenProps = {
  onBack: () => void;
};

const actionKeys = [
  'kickstandPositioned',
  'bikeLocked',
  'bikeRepositioned',
] as const;

type ActionKey = (typeof actionKeys)[number];

export function PublicOrderScreen({
  onBack,
}: PublicOrderScreenProps) {
  const { t } = useTranslation('publicOrder');
  const [bikeId, setBikeId] = useState('');
  const [notes, setNotes] = useState('');
  const [actions, setActions] = useState<Record<ActionKey, boolean>>({
    kickstandPositioned: false,
    bikeLocked: false,
    bikeRepositioned: false,
  });

  const hasChanges =
    bikeId.length > 0 ||
    notes.length > 0 ||
    actionKeys.some((key) => actions[key]);

  const handleBack = useCallback(() => {
    if (!hasChanges) {
      onBack();
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
          onPress: onBack,
        },
      ],
      { cancelable: true }
    );
  }, [hasChanges, onBack, t]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleBack();
        return true;
      }
    );

    return () => subscription.remove();
  }, [handleBack]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            accessibilityRole="button"
            onPress={handleBack}
            style={styles.backButton}
          >
            <Text style={styles.buttonText}>{t('back')}</Text>
          </Pressable>

          <Text accessibilityRole="header" style={styles.title}>
            {t('title')}
          </Text>

          <Text style={styles.description}>
            {t('description')}
          </Text>

          <Text style={styles.label}>{t('bikeId')}</Text>
          <TextInput
            accessibilityLabel={t('bikeId')}
            value={bikeId}
            onChangeText={setBikeId}
            placeholder={t('bikeIdPlaceholder')}
            placeholderTextColor={colors.charcoal}
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.input}
          />

          <Text accessibilityRole="header" style={styles.label}>
            {t('actions')}
          </Text>
          <Text style={styles.hint}>{t('actionsHint')}</Text>

          <View style={styles.actions}>
            {actionKeys.map((key) => (
              <Pressable
                key={key}
                accessibilityRole="checkbox"
                accessibilityLabel={t(key)}
                accessibilityState={{ checked: actions[key] }}
                onPress={() => {
                  setActions((current) => ({
                    ...current,
                    [key]: !current[key],
                  }));
                }}
                style={({ pressed }) => [
                  styles.action,
                  actions[key] && styles.actionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  accessible={false}
                  style={[
                    styles.checkbox,
                    actions[key] && styles.checkboxSelected,
                  ]}
                >
                  {actions[key] && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.actionText}>{t(key)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>{t('notes')}</Text>
          <TextInput
            accessibilityLabel={t('notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('notesPlaceholder')}
            placeholderTextColor={colors.charcoal}
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.notes]}
          />

          <Text style={styles.evidenceReminder}>
            {t('evidenceReminder')}
          </Text>
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
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.mist,
  },
  buttonText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
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
    marginTop: spacing.sm,
  },
  label: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.charcoal,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.charcoal,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 16,
    padding: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.charcoal,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  actionSelected: {
    backgroundColor: colors.neon,
  },
  checkbox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 6,
  },
  checkboxSelected: {
    backgroundColor: colors.ink,
  },
  checkmark: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
  },
  actionText: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  notes: {
    minHeight: 112,
  },
  evidenceReminder: {
    color: colors.charcoal,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.lg,
  },
});