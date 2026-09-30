import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, AppState, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../../theme/tokens';
import { supabase } from '../../../lib/supabase/client';
import { readOwnTasks, type OwnTasks } from '../../../lib/supabase/read-own-tasks';

function adjacentMonth(month: string, direction: number) {
  const date = new Date(`${month}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + direction);
  return date.toISOString().slice(0, 10);
}

// Shared only within this screen: period and daily totals use the same server fields.
function TaskMetrics({ counted, repeated }: { counted: number; repeated: number }) {
  const { t } = useTranslation('operations');
  return <View style={styles.metrics}>
    {([{ label: 'done', value: counted, color: '#16803C' },
      { label: 'invalid', value: repeated, color: colors.danger }] as const).map((metric, index) => (
      <View key={metric.label} accessible accessibilityLabel={`${t(`history.${metric.label}`)}: ${metric.value}`}
        style={[styles.metric, index === 1 && styles.metricDivider]}>
        <Ionicons name="checkmark-circle-outline" size={36} color={metric.color} accessible={false} />
        <View style={styles.metricText}>
          <Text style={styles.count}>{metric.value}</Text>
          <Text style={styles.description}>{t(`history.${metric.label}`)}</Text>
        </View>
      </View>
    ))}
  </View>;
}

export function TasksScreen() {
  const { t, i18n } = useTranslation('operations');
  const [view, setView] = useState<'today' | 'month'>('today');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const monthly = view === 'month' && selectedDay === null;
  const [month, setMonth] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const reload = useRef<() => void>(() => {});
  const lastDay = useRef<string | null>(null);
  const [data, setData] = useState<OwnTasks | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const scroll = useRef<ScrollView>(null);
  const locale = i18n.language.startsWith('es') ? 'es-ES' : 'en-IE';
  const formatDate = (date: string, monthly = false) => new Intl.DateTimeFormat(locale, {
    timeZone: 'Europe/Dublin', year: 'numeric', month: 'long', ...(monthly ? {} : { day: 'numeric' as const }),
  }).format(new Date(`${date}T12:00:00Z`));

  useFocusEffect(useCallback(() => {
    let active = true;
    let sequence = 0;
    let controller: AbortController | undefined;
    let midnight: ReturnType<typeof setTimeout> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      const request = ++sequence;
      controller?.abort();
      clearTimeout(timeout); clearTimeout(midnight);
      controller = new AbortController();
      const current = controller;
      setStatus('loading'); setData(null);
      timeout = setTimeout(() => {
        if (active && request === sequence) { sequence++; current.abort(); setStatus('error'); }
      }, 20000);
      try {
        const result = await readOwnTasks(supabase, { view: selectedDay ? 'day' : view, month: selectedDay ?? (view === 'month' ? month : null), offset }, current.signal);
        if (!active || request !== sequence) return;
        clearTimeout(timeout);
        const changedDate = lastDay.current !== null && lastDay.current !== result.today;
        lastDay.current = result.today;
        if (view === 'today' && offset > 0 && changedDate) { setOffset(0); return; }
        setData(result); setStatus('ready');
        // Delay supplied by the server, so device timezone/clock cannot select the date.
        midnight = setTimeout(() => { if (offset > 0) setOffset(0); else void load(); }, result.refresh_after_ms);
      } catch {
        if (active && request === sequence) { clearTimeout(timeout); setStatus('error'); }
      }
    };
    reload.current = () => { void load(); };
    void load();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void load();
    });
    return () => {
      active = false; sequence++; controller?.abort();
      reload.current = () => {};
      clearTimeout(timeout); clearTimeout(midnight); subscription.remove();
    };
  }, [view, month, offset, selectedDay]));

  const changeView = (next: 'today' | 'month') => { setView(next); setSelectedDay(null); setOffset(0); };
  const backToMonth = () => { setSelectedDay(null); setOffset(0); scroll.current?.scrollTo({ y: 0, animated: true }); };
  useFocusEffect(useCallback(() => {
    if (!selectedDay) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedDay(null); setOffset(0); return true;
    });
    return () => subscription.remove();
  }, [selectedDay]));
  const refresh = () => { if (offset > 0) setOffset(0); else reload.current(); };
  const turnPage = (next: number) => { setOffset(next); scroll.current?.scrollTo({ y: 0, animated: true }); };
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView ref={scroll} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={require('../../../../assets/brand/moby-logo-on-dark.svg')} contentFit="contain" accessibilityLabel="MOBY" style={styles.headerLogo} />
          <Text accessibilityRole="header" style={styles.title}>{t('tasks')}</Text>
          <Text style={styles.tagline}>{t('tasksTitle')}</Text>
          <View style={styles.taglineAccent} />
        </View>
        <View style={styles.body}>
          <View style={styles.switcher}>
            {(['today', 'month'] as const).map((option) => (
              <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: view === option }}
                onPress={() => changeView(option)} style={[styles.tab, view === option && styles.selected]}>
                <Text style={styles.buttonText}>{t(`history.${option}`)}</Text>
              </Pressable>
            ))}
          </View>
          {selectedDay && <View style={styles.dayNavigation}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('history.backToMonth')} onPress={backToMonth} style={styles.refresh}>
              <Ionicons name="chevron-back" size={22} color={colors.ink} accessible={false} />
              <Text style={styles.buttonText}>{t('history.backToMonth')}</Text>
            </Pressable>
            <Text accessibilityRole="header" style={styles.sectionTitle}>{formatDate(selectedDay)}</Text>
          </View>}
          {status === 'loading'  && <View accessibilityLiveRegion="polite" style={styles.loading}>
            <ActivityIndicator color={colors.ink} /><Text style={styles.description}>{t('history.loading')}</Text>
          </View>}
          {status === 'error' && <View style={styles.card}>
            <Text accessibilityRole="alert" style={styles.error}>{t('history.error')}</Text>
            <Pressable accessibilityRole="button" onPress={refresh} style={styles.button}><Text style={styles.buttonText}>{t('history.retry')}</Text></Pressable>
          </View>}
          {status === 'ready' && data && <>
            {monthly && <Text accessibilityRole="header" style={styles.sectionTitle}>{formatDate(data.period, true)}</Text>}
            {monthly && <View style={styles.switcher}>
              <Pressable accessibilityRole="button" accessibilityLabel={t('history.previousMonth')} disabled={data.period <= '1900-01-01'}
                onPress={() => setMonth(adjacentMonth(data.period, -1))} style={styles.button}>
                <Ionicons name="chevron-back" color={colors.ink} size={22} />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { if (month === null) refresh(); else setMonth(null); }} style={styles.tab}>
                <Text style={styles.buttonText}>{t('history.currentMonth')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={t('history.nextMonth')} disabled={data.period >= data.current_month}
                onPress={() => setMonth(adjacentMonth(data.period, 1))} style={[styles.button, data.period >= data.current_month && styles.disabled]}>
                <Ionicons name="chevron-forward" color={colors.ink} size={22} />
              </Pressable>
            </View>}
            <View style={styles.summary}>
              <TaskMetrics counted={data.counted} repeated={data.repeated} />
            </View>
            <View style={styles.listHeader}>
              {monthly && data.total > 0 && <Text accessibilityRole="header" style={[styles.sectionTitle, styles.listTitle]}>{t('history.daily')}</Text>}
              <Pressable accessibilityRole="button" accessibilityLabel={t('history.refresh')} onPress={refresh} style={styles.refresh}>
                <Ionicons name="refresh-outline" color={colors.ink} size={22} accessible={false} /><Text style={styles.buttonText}>{t('history.refresh')}</Text>
              </Pressable>
            </View>
            {data.total === 0 && <Text style={styles.description}>{t('history.empty')}</Text>}
            {monthly ? data.days.map((day) => (
              <Pressable key={day.day} accessibilityRole="button"
                accessibilityLabel={t('history.openDay', { date: formatDate(day.day) })}
                onPress={() => { setMonth(data.period); setSelectedDay(day.day); setOffset(0); scroll.current?.scrollTo({ y: 0, animated: true }); }}
                style={styles.card}>
                <View style={styles.taskHeader}>
                  <Text style={[styles.sectionTitle, styles.bikeId]}>{formatDate(day.day)}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} accessible={false} />
                </View>
                <TaskMetrics counted={day.counted} repeated={day.repeated} />
              </Pressable>
            )) : data.items.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.taskHeader}>
                  <Text style={[styles.sectionTitle, styles.bikeId]}>{item.bike_external_id}</Text>
                  <Text style={styles.time}>{new Intl.DateTimeFormat(locale, {
                    timeZone: 'Europe/Dublin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
                  }).format(new Date(item.created_at))}</Text>
                  <View accessible accessibilityRole="image" accessibilityLabel={t(item.counted ? 'history.done' : 'history.invalidStatus')}>
                    <Ionicons name="checkmark-circle" size={26} color={item.counted ? '#16803C' : colors.danger} accessible={false} />
                  </View>
                </View>
                {([
                  { enabled: item.kickstand_positioned, label: 'kickstandPositioned', icon: 'bicycle-outline' },
                  { enabled: item.bike_locked, label: 'bikeLocked', icon: 'lock-closed-outline' },
                  { enabled: item.bike_repositioned, label: 'bikeRepositioned', icon: 'move-outline' },
                ] as const).filter((action) => action.enabled).map((action) => (
                  <View key={action.label} style={styles.action}>
                    <Ionicons name={action.icon} size={22} color={colors.ink} accessible={false} />
                    <Text style={[styles.description, styles.actionText]}>{t(`publicOrder:${action.label}`)}</Text>
                  </View>
                ))}
              </View>
            ))}
            {!monthly && (offset > 0 || data.has_more) && <View style={styles.pagination}>
              <Text style={styles.description}>{t('history.page', { page: offset / 50 + 1 })}</Text>
              <View style={styles.switcher}>
                <Pressable accessibilityRole="button" disabled={offset === 0} onPress={() => turnPage(Math.max(0, offset - 50))} style={[styles.tab, offset === 0 && styles.disabled]}>
                  <Text style={styles.buttonText}>{t('history.previousPage')}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={!data.has_more} onPress={() => turnPage(offset + 50)} style={[styles.tab, !data.has_more && styles.disabled]}>
                  <Text style={styles.buttonText}>{t('history.nextPage')}</Text>
                </Pressable>
              </View>
            </View>}
          </>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1, paddingBottom: spacing.xl },
  hero: { backgroundColor: '#262626', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 56, gap: spacing.sm },
  headerLogo: { width: 166, height: 30, marginBottom: spacing.sm },
  title: { color: colors.neon, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: '#C3C7CD', fontSize: 16, lineHeight: 24 },
  taglineAccent: { width: 56, height: 3, backgroundColor: colors.neon, marginTop: spacing.xs },
  body: { flex: 1, marginTop: -spacing.lg, backgroundColor: colors.white, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg, gap: spacing.md },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  switcher: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  tab: { flex: 1, minHeight: 48, borderRadius: radii.sm, padding: spacing.sm, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.neon },
  button: { minHeight: 48, minWidth: 48, padding: spacing.sm, backgroundColor: colors.canvas, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  loading: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm },
  summary: { backgroundColor: colors.selected, borderRadius: radii.md, padding: spacing.md },
  count: { color: colors.ink, fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] },
  refresh: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginLeft: 'auto', gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.sm },
  metrics: { flexDirection: 'row' },
  metric: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm },
  metricDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  metricText: { flexShrink: 1 },
  dayNavigation: { gap: spacing.sm },
  listHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  listTitle: { flexShrink: 1 },
  taskHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  bikeId: { flexGrow: 1 },
  time: { color: colors.muted, fontSize: 14, fontVariant: ['tabular-nums'] },
  action: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  actionText: { flex: 1 },
  error: { color: colors.danger, fontSize: 15, lineHeight: 22 },
  disabled: { opacity: 0.4 },
  pagination: { gap: spacing.sm },
});
