import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowIcon, T } from '../components/ui';
import { TabBar } from '../components/TabBar';
import { Stamp } from '../components/Stamp';
import { useAuth } from '../lib/auth';
import { MILESTONES, monthYear, shortDate, useStats } from '../lib/entries';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

// Profile / Stats — Active · New User · Milestones Earned (Figma 2012:9761 / 10011 / 9880)
export default function Profile() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const stats = useStats();
  const isNew = stats.sightings === 0;
  // TODO: replace with the real leaderboard rank once flocks/leaderboard exist.
  const rank = stats.sightings >= 20 ? 'top 100 birders' : stats.sightings >= 5 ? 'top 1k birders' : 'top 10k birders';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space['2xl'], gap: space.xl }}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} hitSlop={10} style={styles.nest}>
          <T v="ui">nestkeeping</T>
          <ArrowIcon color={colors.iconDefault} />
        </Pressable>

        <View style={{ alignItems: 'center', gap: space.xs }}>
          <T v="displayLg" style={{ fontSize: 26, lineHeight: 30 }}>{user?.name?.toLowerCase() || 'birder'}</T>
          <T v="bodyMd" color={colors.textSubtle}>
            {isNew ? 'brand new diary' : `keeping this diary since ${user?.createdAt ? monthYear(user.createdAt) : 'today'}`}
          </T>
          <View style={[styles.rank, { borderColor: colors.borderDefault }]}>
            <T v="ui">{rank}</T>
            <ArrowIcon color={colors.iconDefault} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[[stats.species, 'species met'], [stats.sightings, 'sightings'], [stats.thisWeek, 'this week']].map(([n, l]) => (
            <View key={l} style={[styles.stat, { backgroundColor: colors.surfacePage }]}>
              <T v="title" style={{ fontSize: 30, lineHeight: 36 }}>{String(n)}</T>
              <T v="caption" color={colors.textSubtle} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>{l}</T>
            </View>
          ))}
        </View>

        <View style={{ gap: space.sm }}>
          <T v="overline" color={colors.textLight}>little milestones</T>
          {MILESTONES.map((m) => {
            const got = stats.earned[m.id];
            return (
              <Pressable key={m.id} disabled={!got} onPress={() => router.push({ pathname: '/milestone', params: { id: m.id } })}
                style={[styles.milestone, { backgroundColor: colors.surfacePage }]} accessibilityLabel={`${m.title}, ${got ? 'earned' : 'yet to come'}`}>
                {got ? <Stamp color={m.colorKey} size={32} /> : <View style={[styles.empty, { borderColor: colors.borderDefault }]} />}
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="ui" color={got ? colors.textDefault : colors.textSubtle}>{m.title}</T>
                  <T v="caption" color={colors.textLight}>
                    {got ? `${m.earned.replace('{species}', got.species ?? 'bird')} • ${shortDate(got.date)}` : `yet to come — ${m.todo}`}
                  </T>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <TabBar active="me" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nest: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingTop: space.lg },
  rank: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, height: 34, borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed', marginTop: space.xs },
  stat: { flex: 1, alignItems: 'center', gap: space.sm, paddingVertical: space.lg, borderRadius: radius.lg },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, paddingVertical: space.md, borderRadius: radius.md },
  empty: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed' },
});
