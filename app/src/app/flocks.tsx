import { FlatList, StyleSheet, View } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { T } from '../components/ui';
import { Rise } from '../components/motion';
import { TabBar } from '../components/TabBar';
import { BirdThumb } from '../components/BirdThumb';
import { EmptyNest } from '../components/illustrations';
import { collection, shortDate, useEntries } from '../lib/entries';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

// Flocks — Collection / Species List & Empty State (Figma 2012:10428 / 10371)
export default function Flocks() {
  const { colors } = useTheme();
  const species = collection(useEntries() ?? []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top']}>
      <View style={styles.head}>
        <T v="displayLg">your collection of species</T>
        <T v="caption" color={colors.textSubtle} style={styles.count}>{species.length} species</T>
      </View>
      {species.length === 0 ? (
        <View style={styles.empty}>
          <EmptyNest width={210} />
          <T v="bodyMd" style={{ textAlign: 'center', maxWidth: 240 }}>no species yet — go meet your first bird</T>
        </View>
      ) : (
        <FlatList
          data={species}
          keyExtractor={(s) => s.name}
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space['2xl'], gap: space.md }}
          renderItem={({ item, index }) => (
            <Rise i={index}>
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/bird', params: { name: item.name } })}
              style={({ pressed }) => [styles.card, { backgroundColor: colors.surfacePage, shadowColor: colors.shadow, opacity: pressed ? 0.8 : 1 }]}>
              <BirdThumb uri={item.photo} size={58} />
              <View style={{ flex: 1, gap: 2 }}>
                <T v="label" style={{ fontSize: 16, lineHeight: 22 }}>{item.name}</T>
                <T v="bodySm" color={colors.textLight}>first met {shortDate(item.firstMet)} • seen ×{item.seen}</T>
              </View>
            </Pressable>
            </Rise>
          )}
        />
      )}
      <TabBar active="flocks" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingTop: space.xl, paddingBottom: space.xl, gap: space.xs },
  count: { textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl, paddingBottom: space['3xl'] },
  card: { flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.md, borderRadius: radius.lg, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
});
