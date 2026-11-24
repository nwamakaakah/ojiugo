import { Photo } from '../components/Photo';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { BackLink, T } from '../components/ui';
import { Icon } from '../components/Icon';
import { BirdThumb } from '../components/BirdThumb';
import { collection, shortDate, updateEntry, useEntries } from '../lib/entries';
import { nameMystery } from '../lib/naming';
import { speciesInfo } from '../lib/species';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

// Bird Info / Songs & Calls (Figma 2012:10542)
export default function Bird() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { name = '', entry: entryId } = useLocalSearchParams<{ name?: string; entry?: string }>();
  const all = useEntries() ?? [];
  const mystery = entryId ? all.find((e) => e.id === entryId) : undefined;
  const s = collection(all).find((x) => x.name.toLowerCase() === name.toLowerCase());
  const info = speciesInfo(name);
  const photos = (s?.entries ?? []).filter((e) => e.photo).map((e) => ({ uri: e.photo!, focus: e.photoFocus }));
  const [slide, setSlide] = useState(0);
  const slideW = width - space.lg * 2;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setSlide(Math.round(e.nativeEvent.contentOffset.x / slideW));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space['3xl'] }}>
        <BackLink />

        <View style={{ gap: space.sm }}>
          {photos.length ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScroll} style={{ borderRadius: radius.xl }}>
              {photos.map((p, i) => <Photo key={`${p.uri}-${i}`} uri={p.uri} focus={p.focus} style={{ width: slideW, height: 240, borderRadius: radius.xl }} />)}
            </ScrollView>
          ) : (
            <View style={[styles.photo, { backgroundColor: colors.softNeutralFill }]}><BirdThumb size={96} /></View>
          )}
          {photos.length > 1 ? (
            <View style={styles.dots}>
              {photos.map((p, i) => <View key={i} style={[styles.dot, i === slide && styles.dotOn, { backgroundColor: i === slide ? colors.actionPrimary : colors.borderDefault }]} />)}
            </View>
          ) : null}
        </View>

        <View style={{ gap: space.xs }}>
          <T v="title" style={{ fontSize: 24 }}>{name}</T>
          {info.scientific ? <T v="bodySm" color={colors.textSubtle} style={{ fontStyle: 'italic' }}>{info.scientific}</T> : null}
        </View>

        {info.recordings?.length ? (
          <View style={{ gap: space.md }}>
            <T v="overline" color={colors.textLight}>songs & calls</T>
            {info.recordings.map((r, i) => (
              <View key={i} style={[styles.rec, { backgroundColor: colors.surfacePage }]}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.actionPrimary, alignItems: 'center', justifyContent: 'center', paddingLeft: 3 }}><Icon name="play" color={colors.textOnPrimary} size={17} /></View>
                <View style={{ flex: 1 }}><T v="label">{r.kind}</T><T v="bodySm" color={colors.textLight}>{r.place}</T></View>
                <T v="caption" color={colors.textLight}>{r.length}</T>
              </View>
            ))}
            <T v="caption" color={colors.textLight}>recordings via Xeno-canto • songs & calls vary by region</T>
          </View>
        ) : null}

        {info.about ? (
          <View style={{ gap: space.md }}>
            <T v="overline" color={colors.textLight}>about</T>
            <T v="bodyLg" style={{ fontSize: 17, lineHeight: 28 }}>{info.about}</T>
          </View>
        ) : null}

        {info.facts?.length ? (
          <View style={{ gap: space.md }}>
            <T v="overline" color={colors.textLight}>quick facts</T>
            <View style={styles.facts}>
              {info.facts.map((f) => (
                <View key={f.label} style={[styles.fact, { backgroundColor: colors.surfacePage }]}>
                  <T v="caption" color={colors.textSubtle} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>{f.label}</T>
                  <T v="bodyLg" style={{ fontSize: 17 }}>{f.value}</T>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {s ? (
          <View style={{ gap: space.md }}>
            <T v="overline" color={colors.textLight}>your sightings <T v="caption" color={colors.textLight} style={{ textTransform: 'none', letterSpacing: 0 }}>• {s.seen} sighted so far</T></T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
              {s.entries.map((e) => (
                <View key={e.id} style={{ gap: space.sm, width: 110 }}>
                  <BirdThumb uri={e.photo} focus={e.photoFocus} size={110} r={radius.lg} />
                  <T v="caption" color={colors.textSubtle}>{shortDate(e.createdAt).toLowerCase()}{e.place ? ` • ${e.place}` : ''}</T>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
      {mystery ? (
        <View style={[styles.decide, { borderTopColor: colors.borderSubtle, backgroundColor: colors.bgApp }]}>
          <View style={{ flex: 1 }}><T v="ui" color={colors.textSubtle}>is this your {shortDate(mystery.createdAt).toLowerCase()} bird?</T></View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Pressable accessibilityRole="button" style={styles.no} onPress={async () => { await updateEntry(mystery.id, { suggestion: undefined, rejected: [...(mystery.rejected ?? []), name] }); router.replace({ pathname: '/mystery-result', params: { id: mystery.id, found: '0' } }); }}><T v="button" color={colors.textSubtle}>not my bird</T></Pressable>
            <Pressable accessibilityRole="button" style={[styles.yes, { backgroundColor: colors.actionPrimary }]} onPress={() => nameMystery(mystery, name)}><T v="button" color={colors.textOnPrimary}>that’s my bird</T></Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  photo: { height: 240, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOn: { width: 32 },
  rec: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.lg },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  decide: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
  no: { paddingHorizontal: space.md, paddingVertical: space.md },
  yes: { paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.pill, overflow: 'hidden' },
  fact: { width: '47.5%', minHeight: 110, padding: space.lg, borderRadius: radius.lg, justifyContent: 'space-between' },
});
