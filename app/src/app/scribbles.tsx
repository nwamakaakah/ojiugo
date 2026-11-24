import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowIcon, BackLink, T } from '../components/ui';
import { shortDate, useEntries } from '../lib/entries';
import { useTheme } from '../theme/ThemeProvider';
import { primitives, radius, space } from '../theme/tokens';

const TAPE = [primitives.terracotta['200'], primitives.rose['200'], primitives.plum['200'], primitives.sage['200']];

// Scribbles / List (Figma 2012:5231)
export default function Scribbles() {
  const { colors } = useTheme();
  const list = (useEntries() ?? []).filter((e) => e.kind === 'scribble').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <FlatList
        data={list}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: space.lg, gap: space.xl }}
        ListHeaderComponent={
          <View style={{ gap: space.sm, marginBottom: space.sm }}>
            <BackLink />
            <T v="displayLg">scribbles</T>
            <T v="bodyLg" color={colors.textSubtle}>quick notes waiting for the full story</T>
          </View>
        }
        ListEmptyComponent={<T v="bodyMd" color={colors.textSubtle}>nothing waiting — every scribble has its full page</T>}
        renderItem={({ item, index }) => (
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/write', params: { id: item.id } })}
            style={{ backgroundColor: colors.surfacePage, borderRadius: radius.xl, padding: space.lg, gap: space.md, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
            <View style={{ position: 'absolute', top: -7, width: 64, height: 22, backgroundColor: TAPE[index % TAPE.length], opacity: 0.8, ...(index % 2 ? { right: 60 } : { left: 44 }) }} />
            <T v="bodySm" color={colors.textLight}>{[shortDate(item.createdAt).toLowerCase(), item.place, item.species].filter(Boolean).join(' • ')}</T>
            <T v="bodyLg">{item.note || 'a bird, no words yet'}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm }}>
              <T v="ui" color={colors.textSubtle}>finish this page</T><ArrowIcon color={colors.iconSubtle} />
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
