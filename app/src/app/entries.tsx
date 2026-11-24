import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowIcon, T } from '../components/ui';
import { PeekingBird } from '../components/illustrations';
import { TabBar } from '../components/TabBar';
import { EntryCard } from '../components/EntryCard';
import { Feather, Notebook, SearchGlyph } from '../components/form';
import { computeStats, useEntries } from '../lib/entries';
import { storage } from '../lib/storage';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

// Entries — Grid View · Grid View With Pending · List View · Empty State (Figma 2012:7172 / 7933 / 8717 / 7098)
export default function Entries() {
  const { colors } = useTheme();
  const all = useEntries() ?? [];
  const [list, setList] = useState(false);
  useEffect(() => { storage.get('ojiugo.entriesAsList', false).then(setList); }, []);
  const flip = () => { setList(!list); storage.set('ojiugo.entriesAsList', !list); };

  const stats = computeStats(all);
  const pages = all.filter((e) => e.kind !== 'scribble').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const scribbles = all.filter((e) => e.kind === 'scribble').length;
  const mysteries = all.filter((e) => !e.species).length;

  const header = (
    <View style={{ gap: space.lg, paddingBottom: space.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ gap: space.xs }}>
          <T v="displayLg">your entries</T>
          <T v="overline" color={colors.textLight}>{stats.sightings} sightings  •  {stats.species} species</T>
        </View>
        <Pressable accessibilityRole="button" onPress={flip} style={[styles.pill, { borderColor: colors.borderDefault }]}>
          <T v="ui">{list ? 'view as shelf' : 'view as list'}</T>
        </Pressable>
      </View>
      <Pressable accessibilityRole="search" onPress={() => router.push('/search')} style={[styles.search, { borderBottomColor: colors.borderDefault }]}>
        <SearchGlyph color={colors.iconSubtle} />
        <T v="bodyMd" color={colors.textDisabled}>looking for a memory?</T>
      </Pressable>
      {scribbles ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/scribbles')} style={[styles.banner, { backgroundColor: colors.surfacePage }]}>
          <Feather color={colors.iconDefault} /><T v="ui" style={{ flex: 1 }}>{scribbles} {scribbles === 1 ? 'scribble' : 'scribbles'} to finish</T><ArrowIcon color={colors.iconDefault} />
        </Pressable>
      ) : null}
      {mysteries ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/name')} style={[styles.banner, { backgroundColor: colors.softWonderFill }]}>
          <Notebook color={colors.iconDefault} /><T v="ui" style={{ flex: 1 }}>{mysteries} mystery {mysteries === 1 ? 'bird' : 'birds'} waiting to be named</T><ArrowIcon color={colors.iconDefault} />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top']}>
      {pages.length === 0 ? (
        <View style={{ flex: 1, paddingHorizontal: space.lg, paddingTop: space.lg }}>
          {header}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl }}>
            <PeekingBird width={240} />
            <T v="bodyMd" style={{ textAlign: 'center', maxWidth: 220 }}>no birds yet — your first sighting is waiting</T>
          </View>
        </View>
      ) : (
        <FlatList
          key={list ? 'list' : 'grid'}
          data={pages}
          numColumns={list ? 1 : 2}
          keyExtractor={(e) => e.id}
          ListHeaderComponent={header}
          contentContainerStyle={{ padding: space.lg, gap: space.md }}
          columnWrapperStyle={list ? undefined : { gap: space.md }}
          renderItem={({ item, index }) => <EntryCard entry={item} index={index} wide={list} />}
        />
      )}
      <TabBar active="entries" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs, marginTop: space.xs },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderBottomWidth: 1, paddingBottom: space.sm },
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.lg },
});
