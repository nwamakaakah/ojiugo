import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { BackLink, Button, T } from '../components/ui';
import { Icon } from '../components/Icon';
import { Choice, Feather, FeelingChip, Line, SectionLabel } from '../components/form';
import { useToast } from '../components/Toast';
import { PlaceField } from '../components/PlaceField';
import { FramePhoto } from '../components/FramePhoto';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { BREEDING, COUNTS, FEELINGS, SIZES, addEntry, getEntry, loadEntries, newMilestones, parseStamp, updateEntry, type Entry, type Feeling } from '../lib/entries';
import { storage } from '../lib/storage';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

const pad = (n: number) => String(n).padStart(2, '0');

// Entry / Full Form (Figma 2012:6193) and Entry / Rewrite Form (2012:12431).
// ?id=  finish a scribble or rewrite an entry · ?rewrite=1  rewrite mode
export default function Write() {
  const { colors, season } = useTheme();
  const toast = useToast();
  // a new full page can arrive from the scribble sheet carrying what was already jotted there
  const { id, rewrite, species: pSpecies, describe: pDescribe, place: pPlace, coords: pCoords, when: pWhen } =
    useLocalSearchParams<{ id?: string; rewrite?: string; species?: string; describe?: string; place?: string; coords?: string; when?: string }>();
  const isRewrite = rewrite === '1';
  const [base, setBase] = useState<Entry | null>(null);
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoSize, setPhotoSize] = useState<{ width: number; height: number } | undefined>();
  const [photoFocus, setPhotoFocus] = useState<{ x: number; y: number } | undefined>();
  const [name, setName] = useState('');
  const [describe, setDescribe] = useState('');
  const [place, setPlace] = useState('');
  const [coords, setCoords] = useState('');
  const [day, setDay] = useState(''); const [hour, setHour] = useState('');
  const [size, setSize] = useState<Entry['size']>();
  const [count, setCount] = useState<Entry['count']>();
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [more, setMore] = useState('');
  const [breeding, setBreeding] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) {
      if (pSpecies) setName(pSpecies);
      if (pDescribe) setDescribe(pDescribe);
      if (pCoords) setCoords(pCoords);
      if (pPlace) setPlace(pPlace); else storage.get<string>('ojiugo.lastPlace', '').then(setPlace);
      const d = pWhen ? new Date(pWhen) : new Date();
      if (!Number.isNaN(d.getTime())) { setDay(`${pad(d.getDate())}:${pad(d.getMonth() + 1)}:${d.getFullYear()}`); setHour(`${pad(d.getHours())}:${pad(d.getMinutes())}`); }
      return;
    }
    getEntry(id).then((e) => {
      if (!e) return;
      setBase(e); setPhoto(e.photo); setPhotoFocus(e.photoFocus); setName(e.species ?? ''); setDescribe(e.describe ?? e.note ?? ''); setPlace(e.place ?? ''); setCoords(e.coords ?? '');
      const d = new Date(e.createdAt); setDay(`${pad(d.getDate())}:${pad(d.getMonth() + 1)}:${d.getFullYear()}`); setHour(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
      setSize(e.size); setCount(e.count); setFeelings(e.feelings ?? []); setMore(e.more ?? ''); setBreeding(e.breeding ?? []);
    });
  }, [id]);

  const pick = async () => {
    // keep the whole photo (no forced square crop); the birder marks where the bird is instead
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false });
    if (r.canceled) return;
    const a = r.assets[0];
    try {
      // shrink big camera photos so they upload quickly (long side 1800px is plenty for every card)
      const long = Math.max(a.width, a.height);
      const ctx = ImageManipulator.manipulate(a.uri);
      if (long > 1800) ctx.resize(a.width >= a.height ? { width: 1800 } : { height: 1800 });
      const img = await (await ctx.renderAsync()).saveAsync({ compress: 0.82, format: SaveFormat.JPEG });
      setPhoto(img.uri); setPhotoSize({ width: img.width, height: img.height });
    } catch {
      setPhoto(a.uri); setPhotoSize({ width: a.width, height: a.height });
    }
    setPhotoFocus(undefined);
  };
  const toggle = <K,>(list: K[], v: K) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const save = async () => {
    const when = parseStamp(day, hour, base?.createdAt ?? new Date().toISOString());
    if (!when) return toast({ text: 'that date looks off — try dd:mm:yyyy and 00:00' });
    setBusy(true);
    const species = name.trim() || undefined;
    const fields: Partial<Entry> = {
      kind: 'entry', createdAt: when, photo, photoFocus: photo ? photoFocus : undefined, species, describe: describe.trim() || undefined, place: place.trim() || undefined,
      coords: coords.trim() || undefined, size, count, feelings, more: more.trim() || undefined, breeding, season: base?.season ?? season,
      namedByUser: species ? (base?.species === species ? base.namedByUser : true) : false,
      wasMystery: base && !base.species && species ? true : base?.wasMystery,
    };
    const before = await loadEntries();
    let entryId = id;
    if (base) await updateEntry(base.id, fields);
    else entryId = (await addEntry(fields as Omit<Entry, 'id'>)).id;
    if (place.trim()) await storage.set('ojiugo.lastPlace', place.trim());
    const earned = await newMilestones(before, await loadEntries());
    setBusy(false);
    const next = isRewrite ? `/rewritten?id=${entryId}` : `/entry-saved?id=${entryId}`;
    if (earned.length) router.replace({ pathname: '/milestone', params: { id: earned[0], next } });
    else router.replace(next as never);
  };

  const group = { gap: space.sm };
  const wrap = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: space.sm };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space['2xl'], paddingBottom: space['3xl'] }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: space.sm }}>
          <BackLink />
          <T v="displayLg">{isRewrite ? 'rewrite this entry' : 'write your diary'}</T>
          <T v="bodyLg" color={colors.textSubtle}>{isRewrite ? 'polish your notes — nothing’s set in stone' : 'take your time — this one’s for keeps'}</T>
        </View>

        {photo ? (
          <FramePhoto uri={photo} size={photoSize} focus={photoFocus} onFocus={setPhotoFocus} onChange={pick} />
        ) : (
        <Pressable accessibilityRole="button" accessibilityLabel="upload a photo" onPress={pick}
          style={{ borderRadius: radius.xl, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderDefault, backgroundColor: colors.surfacePage, minHeight: 170, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
          <View style={{ position: 'absolute', top: -8, width: 64, height: 22, backgroundColor: colors.softNeutralFill, opacity: 0.9 }} />
            <View style={{ alignItems: 'center', gap: space.sm, padding: space.lg }}>
              <Icon name="camera" color={colors.iconDefault} size={30} />
              <T v="label">tap to upload photo</T>
              <T v="caption" color={colors.textSubtle}>no good shot? you can describe instead</T>
            </View>
        </Pressable>
        )}

        <View style={group}>
          <SectionLabel note="completely fine if not">know its name?</SectionLabel>
          <Line value={name} onChangeText={setName} placeholder="it’s fine not to know" autoCapitalize="words" />
          <T v="caption" color={colors.textSubtle}>birds with no name land in the diary as a mystery bird — ID it any time</T>
        </View>
        <View style={group}>
          <SectionLabel note="in your own words">describe the bird</SectionLabel>
          <Line value={describe} onChangeText={setDescribe} placeholder="what do you remember about it?" multiline />
        </View>
        <View style={group}>
          <SectionLabel>where did you see it?</SectionLabel>
          <PlaceField place={place} coords={coords} onChange={(p, c) => { setPlace(p); setCoords(c); }} />
        </View>
        <View style={group}>
          <SectionLabel>when did you see it?</SectionLabel>
          <Line value={day} onChangeText={setDay} placeholder="dd:mm:yyyy" keyboardType="numbers-and-punctuation" />
          <Line value={hour} onChangeText={setHour} placeholder="00:00" keyboardType="numbers-and-punctuation" />
        </View>
        <View style={group}>
          <SectionLabel>what size was it?</SectionLabel>
          <View style={wrap}>{SIZES.map((s) => <Choice key={s} label={s} on={size === s} onPress={() => setSize(size === s ? undefined : s)} />)}</View>
        </View>
        <View style={group}>
          <SectionLabel>how many did you count?</SectionLabel>
          <View style={wrap}>{COUNTS.map((c) => <Choice key={c} label={c} on={count === c} onPress={() => setCount(count === c ? undefined : c)} />)}</View>
        </View>
        <View style={group}>
          <SectionLabel>how did you feel?</SectionLabel>
          <View style={wrap}>{FEELINGS.map((f) => <FeelingChip key={f} feeling={f} on={feelings.includes(f)} onPress={() => setFeelings(toggle(feelings, f))} />)}</View>
        </View>
        <View style={group}>
          <SectionLabel>care to say more?</SectionLabel>
          <Line value={more} onChangeText={setMore} placeholder="feel free to get poetic" multiline />
        </View>
        <View style={group}>
          <SectionLabel note="for the serious notebook">breeding evidence</SectionLabel>
          <View style={wrap}>{BREEDING.map(([code, label]) => <Choice key={code} code={code} label={label} on={breeding.includes(code)} onPress={() => setBreeding(toggle(breeding, code))} />)}</View>
        </View>

        <View style={{ gap: space.md }}>
          <Button title="save entry" onPress={save} loading={busy} />
          {!base ? (
            <Pressable accessibilityRole="button" onPress={() => router.replace('/scribble')} style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: space.sm, padding: space.sm }}>
              <Feather color={colors.iconSubtle} /><T v="ui" color={colors.textSubtle}>scribble instead</T>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
