import { FlatList, View } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowIcon, BackLink, T } from '../components/ui';
import { Rise } from '../components/motion';
import { shortDate, useEntries } from '../lib/entries';
import { useTheme } from '../theme/ThemeProvider';
import { primitives, radius, space } from '../theme/tokens';

// Washi tape, measured from Scribbles / List (Figma 2012:5231): pale peach, blush-grey and lavender strips,
// 52 × 18, overlapping the card's top edge, stepping left → right → middle down the list.
const TAPE = [primitives.terracotta['100'], primitives.rose['100'], primitives.plum['100']];
const TAPE_AT = [{ left: 36, rotate: '-1.5deg' }, { right: 50, rotate: '1deg' }, { left: 146, rotate: '-0.5deg' }] as const;

// Scribbles / List (Figma 2012:5231)
export default function Scribbles() {
  const { colors } = useTheme();
  const list = (useEntries() ?? []).filter((e) => e.kind === 'scribble').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <FlatList
        data={list}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space['2xl'], gap: space.xl }}
        ListHeaderComponent={
          <View style={{ gap: space.sm, marginBottom: space.sm }}>
            <BackLink />
            <T v="displayLg">scribbles</T>
            <T v="bodyLg" color={colors.textSubtle}>quick notes waiting for the full story</T>
          </View>
        }
        ListEmptyComponent={<T v="bodyMd" color={colors.textSubtle}>nothing waiting — every scribble has its full page</T>}
        renderItem={({ item, index }) => (
          <Rise i={index}>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/write', params: { id: item.id } })}
            style={{ backgroundColor: colors.surfacePage, borderRadius: 20, paddingHorizontal: space.lg, paddingTop: space.lg + 2, paddingBottom: space.xl + 2,
              shadowColor: colors.shadow, shadowOpacity: 0.7, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
            {(() => { const at = TAPE_AT[index % TAPE_AT.length]; const { rotate, ...pos } = at;
              return <View style={{ position: 'absolute', top: -7, width: 52, height: 18, backgroundColor: TAPE[index % TAPE.length], opacity: 0.85, transform: [{ rotate }], ...pos }} />; })()}
            {/* date • place • name, with small round dots between (as drawn) */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6 }}>
              {[shortDate(item.createdAt).toLowerCase(), item.place, item.species].filter(Boolean).map((bit, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6 }}>
                  {i ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSubtle }} /> : null}
                  <T v="ui" color={colors.textSubtle} style={{ fontSize: 13 }}>{bit}</T>
                </View>
              ))}
            </View>
            <T v="bodyLg" style={{ marginTop: space.lg, fontSize: 15.5, lineHeight: 24 }}>{item.note || 'a bird, no words yet'}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xl }}>
              <T v="bodyMd" color={colors.textInteractive}>finish this page</T><ArrowIcon color={colors.textInteractive} />
            </View>
          </Pressable>
          </Rise>
        )}
      />
    </SafeAreaView>
  );
}
