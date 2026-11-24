import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { ArrowIcon, T } from '../components/ui';
import { TabBar } from '../components/TabBar';
import { BirdThumb } from '../components/BirdThumb';
import { Stamp } from '../components/Stamp';
import { SleepingBird } from '../components/illustrations';
import { MILESTONES, computeStats, shortDate, useEntries } from '../lib/entries';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

// Calls — Notification Feed / Empty State (Figma 2012:9306 / 9244)
export default function Calls() {
  const { colors } = useTheme();
  const entries = useEntries() ?? [];
  const suggestions = entries.filter((e) => !e.species && e.suggestion);
  const mysteries = entries.filter((e) => !e.species);
  const earned = computeStats(entries).earned;
  const milestones = MILESTONES.filter((m) => earned[m.id]).reverse();
  const empty = suggestions.length === 0 && mysteries.length === 0 && milestones.length === 0;
  const notebook = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${colors.iconDefault}" stroke-width="1.3" stroke-linecap="round"><rect x="5.5" y="3.5" width="13" height="17" rx="1.6"/><path d="M8.5 3.5v17M11 8.5h4.5M11 11.5h4.5"/></svg>`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top']}>
      <View style={styles.head}>
        <T v="displayLg">calls for you</T>
        <T v="bodyMd" color={colors.textSubtle}>everything that needs your attention</T>
      </View>

      {empty ? (
        <View style={styles.empty}>
          <SleepingBird width={300} />
          <T v="bodyMd">all quiet — no calls right now</T>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space['2xl'], gap: space.md }}>
          {suggestions.map((e) => (
            <View key={e.id} style={[styles.card, styles.big, { backgroundColor: colors.surfacePage, shadowColor: colors.shadow }]}>
              <T v="caption" color={colors.textLight}>a name, maybe?</T>
              <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                <BirdThumb uri={e.photo} size={50} r={radius.sm} />
                <T v="bodyLg" color={colors.textSubtle} style={{ flex: 1 }}>
                  we think your {shortDate(e.createdAt).toLowerCase()} bird might be a <T v="label" style={{ fontSize: 16 }}>{e.suggestion!.species}</T>
                </T>
              </View>
              <T v="caption" color={colors.textLight}>identified from your {e.suggestion!.source}</T>
              <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/bird', params: { name: e.suggestion!.species, entry: e.id } })}
                style={({ pressed }) => [styles.cta, { backgroundColor: pressed ? colors.actionPrimaryPressed : colors.actionPrimary }]}>
                <T v="button" color={colors.textOnPrimary}>view the bird’s info</T>
              </Pressable>
            </View>
          ))}

          {mysteries.length > 0 ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/name')}
              style={[styles.card, styles.row, { backgroundColor: colors.surfacePage, shadowColor: colors.shadow }]}>
              <SvgXml xml={notebook} width={24} height={24} />
              <View style={{ flex: 1, gap: 2 }}>
                <T v="ui" color={colors.textDefault}>{mysteries.length} mystery {mysteries.length === 1 ? 'bird' : 'birds'} waiting to be named</T>
                <T v="caption" color={colors.textLight}>name them anytime</T>
              </View>
              <ArrowIcon color={colors.iconDefault} />
            </Pressable>
          ) : null}

          {milestones.map((m) => (
            <Pressable key={m.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/milestone', params: { id: m.id } })}
              style={[styles.card, styles.row, { backgroundColor: colors.surfacePage }]}>
              <Stamp color={m.colorKey} size={36} />
              <View style={{ flex: 1, gap: 2 }}>
                <T v="ui" color={colors.textDefault}>milestone — {m.title}</T>
                <T v="caption" color={colors.textLight}>{m.id === 'first-bird' ? 'you’ve started your diary. welcome.' : m.earned.replace('{species}', earned[m.id]?.species ?? 'bird')}</T>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <TabBar active="calls" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingTop: space.xl, paddingBottom: space.xl, gap: space.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, paddingBottom: space['3xl'] },
  card: { borderRadius: radius.lg, padding: space.lg },
  big: { gap: space.md, borderRadius: radius.xl, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  cta: { height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: space.xs },
});
