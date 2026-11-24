import { useRef, useState, type ComponentRef } from 'react';
import { Image, Modal, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { BackLink, T } from '../components/ui';
import { Rise } from '../components/motion';
import { BirdThumb } from '../components/BirdThumb';
import { BirdieCard } from '../components/BirdieCard';
import { FeelingChip, Stamp } from '../components/form';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';
import { BREEDING, deleteEntry, stampTime, useEntry } from '../lib/entries';
import { speciesInfo } from '../lib/species';
import { SEASON_NAME } from '../lib/countries';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

// Entry / Detail — Identified Bird · Mystery Bird (Compact/Full) + Share Page (Figma 2012:5548 / 5315 / 5806 / 10936)
export default function EntryDetail() {
  const { colors } = useTheme();
  const toast = useToast();
  const { width: winW } = useWindowDimensions();
  const confirm = useConfirm();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const e = useEntry(id);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  if (!e) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp, padding: space.lg }}><BackLink />{e === null ? <T v="bodyMd" style={{ marginTop: space.xl }}>this page isn’t in your diary any more</T> : null}</SafeAreaView>;

  const named = !!e.species;
  const info = named ? speciesInfo(e.species!) : {};
  const sections = [['my description', e.describe ?? e.note], ['my feelings', e.more]].filter(([, v]) => v) as [string, string][];
  const sing = BREEDING.find(([c]) => c === e.breeding?.[0]);

  const tear = async () => {
    const ok = await confirm({ title: 'tear out this page?', body: 'this page will be crumpled up for good — it can’t be smoothed out again.', cancel: 'keep it', confirm: 'tear it out', tone: 'critical' });
    if (ok) { await deleteEntry(e.id); router.replace('/torn'); }
  };
  const download = async () => {
    try {
      if (Platform.OS === 'web') { toast({ text: 'saving cards works in the phone app' }); return; }
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) return toast({ text: 'allow photo access to save your card' });
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);
      setSharing(false); router.push('/stamp-saved');
    } catch { toast({ text: 'couldn’t save the card — try again?' }); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: space['3xl'] }}>
        <BackLink />
        <Rise delay={60}>
        <View style={[styles.page, { backgroundColor: colors.surfacePage, shadowColor: colors.shadow }]}>
          <View style={[styles.tape, { backgroundColor: colors.softNeutralFill }]} />
          {e.photo ? <Image source={{ uri: e.photo }} style={styles.photo} /> : <View style={[styles.photo, { backgroundColor: colors.softNeutralFill, alignItems: 'center', justifyContent: 'center' }]}>{named ? <BirdThumb size={80} /> : null}</View>}

          <View style={styles.titleRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <T v="title" style={{ fontSize: 22 }}>{e.species ?? 'Mystery bird'}</T>
              <T v="caption" color={colors.textSubtle}>{named ? info.scientific ?? '' : 'come back and identify later'}</T>
            </View>
            <Pressable accessibilityRole="button" onPress={() => (named ? setSharing(true) : router.push({ pathname: '/name', params: { id: e.id } }))}
              style={[styles.pill, { borderColor: colors.borderDefault }]}>
              <T v="ui">{named ? 'share card' : 'identify bird'}</T>
            </Pressable>
          </View>

          <View style={styles.wrap}>
            <Stamp label={stampTime(e.createdAt)} />
            {e.place ? <Stamp label={e.place} /> : null}
            {e.count ? <Stamp label={e.count} /> : null}
          </View>
          <View style={styles.wrap}>
            {sing ? <View style={[styles.code, { backgroundColor: colors.softInteractiveFill, borderColor: colors.iconDefault }]}><T v="label">{sing[0]}</T><T v="ui" color={colors.textSubtle}>{sing[1]}</T></View> : null}
            {e.season ? <Stamp label={SEASON_NAME[e.season]} /> : null}
            {(e.feelings ?? []).map((f) => <FeelingChip key={f} feeling={f} on />)}
          </View>

          {sections.map(([label, text]) => (
            <View key={label} style={{ gap: space.sm, marginTop: space.lg }}>
              <T v="overline" color={colors.textSubtle}>{label}</T>
              <T v="bodyLg" style={{ fontSize: 17, lineHeight: 27 }}>{text}</T>
            </View>
          ))}

          <View style={[styles.rule, { borderColor: colors.borderDefault }]} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/write', params: { id: e.id, rewrite: '1' } })} hitSlop={8}><T v="ui" color={colors.textSubtle}>rewrite this page</T></Pressable>
            <Pressable accessibilityRole="button" onPress={tear} hitSlop={8}><T v="ui" color={colors.textCritical}>tear it out</T></Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={() => (named ? router.push({ pathname: '/bird', params: { name: e.species! } }) : router.push({ pathname: '/name', params: { id: e.id } }))}
            style={[styles.learn, { backgroundColor: colors.softInteractiveFill }]}>
            <T v="button" color={colors.softInteractiveLabel}>{named ? 'learn about your bird' : 'identify your bird'}</T>
          </Pressable>
        </View>
        </Rise>
      </ScrollView>

      {/* Entry / Detail - Identified Bird - Share Page (Figma 2012:10936) */}
      <Modal visible={sharing} transparent animationType="slide" onRequestClose={() => setSharing(false)}>
        <View style={{ flex: 1, backgroundColor: colors.overlayScrim, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surfacePage, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', maxHeight: '96%' }}>
            <View style={{ paddingHorizontal: space.lg, paddingTop: 28, paddingBottom: 18, borderBottomWidth: 1, borderColor: colors.borderSubtle }}>
              <T v="displayLg" style={{ fontSize: 25, lineHeight: 30 }}>share your birdie card with others</T>
            </View>
            <ScrollView bounces={false}>
              <View ref={cardRef} collapsable={false}><BirdieCard entry={e} width={winW} /></View>
            </ScrollView>
            <SafeAreaView edges={['bottom']} style={{ flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md }}>
              <Pressable accessibilityRole="button" onPress={() => setSharing(false)} style={[styles.sheetBtn, { borderWidth: 1, borderColor: colors.borderDefault }]}><T v="button">close</T></Pressable>
              <Pressable haptic accessibilityRole="button" onPress={download} style={[styles.sheetBtn, { backgroundColor: colors.actionPrimary }]}><T v="button" color={colors.textOnPrimary}>download card</T></Pressable>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { marginTop: space.lg, padding: space.lg, borderRadius: radius.sm, gap: space.md, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tape: { position: 'absolute', top: 4, alignSelf: 'center', width: 64, height: 22, zIndex: 1, opacity: 0.9 },
  photo: { width: '100%', height: 230, borderRadius: radius.xl },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, marginTop: space.md },
  pill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, height: 36, justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  code: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, height: 44, borderRadius: radius.sm, borderWidth: 1, borderStyle: 'dashed' },
  rule: { borderTopWidth: 1, borderStyle: 'dotted', marginTop: space.xl, paddingTop: space.sm },
  learn: { height: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: space.lg },
  sheetBtn: { flex: 1, height: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
