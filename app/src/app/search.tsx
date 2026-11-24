import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BackLink, T } from '../components/ui';
import { Rise } from '../components/motion';
import { BirdThumb } from '../components/BirdThumb';
import { Choice, FeelingChip, Line, SearchGlyph, SectionLabel } from '../components/form';
import { useAuth } from '../lib/auth';
import { FEELINGS, shortDate, useEntries, type Feeling } from '../lib/entries';
import { countryByName, SEASON_NAME } from '../lib/countries';
import { SEASONS, radius, space, type Season } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

// Search / Filters · Results (Figma 2012:10207 / 10279)
export default function Search() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const all = useEntries() ?? [];
  const [q, setQ] = useState('');
  const [feel, setFeel] = useState<Feeling | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const seasons: Season[] = countryByName(user?.country)?.seasons ?? SEASONS.map((s) => s.id).filter((s) => s !== 'wet' && s !== 'dry');

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t && !feel && !season) return [];
    return all.filter((e) => {
      const text = [e.species, e.place, e.note, e.describe, e.more].filter(Boolean).join(' ').toLowerCase();
      return (!t || text.includes(t)) && (!feel || e.feelings?.includes(feel)) && (!season || e.season === season);
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [all, q, feel, season]);
  const searching = !!(q.trim() || feel || season);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <FlatList
        data={results}
        keyExtractor={(e) => e.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, gap: space.md }}
        ListHeaderComponent={
          <View style={{ gap: space.xl, marginBottom: space.lg }}>
            <View style={{ gap: space.sm }}>
              <BackLink />
              <T v="displayLg">looking for a memory?</T>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <SearchGlyph color={colors.iconSubtle} />
              <Line value={q} onChangeText={setQ} placeholder="a bird, a place, a word you wrote" autoFocus style={{ flex: 1 }} />
            </View>
            <View style={{ gap: space.md }}>
              <SectionLabel>or by a feeling</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {FEELINGS.map((f) => <FeelingChip key={f} feeling={f} on={feel === f} onPress={() => setFeel(feel === f ? null : f)} />)}
              </View>
            </View>
            <View style={{ gap: space.md }}>
              <SectionLabel>or a season</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {seasons.map((s) => <Choice key={s} label={SEASON_NAME[s]} on={season === s} onPress={() => setSeason(season === s ? null : s)} />)}
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={searching ? <T v="bodyMd" color={colors.textSubtle}>no memories match that yet</T> : undefined}
        renderItem={({ item, index }) => (
          <Rise i={index}>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/entry', params: { id: item.id } })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.md, borderRadius: radius.lg, backgroundColor: colors.surfacePage, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
            <BirdThumb uri={item.photo} focus={item.photoFocus} size={58} />
            <View style={{ flex: 1, gap: 2 }}>
              <T v="label" style={{ fontSize: 16, lineHeight: 22 }}>{item.species ?? 'Mystery bird'}</T>
              <T v="bodySm" color={colors.textLight}>{[shortDate(item.createdAt), item.place].filter(Boolean).join(' • ')}</T>
            </View>
          </Pressable>
          </Rise>
        )}
      />
    </SafeAreaView>
  );
}
