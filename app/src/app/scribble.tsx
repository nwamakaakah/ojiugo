import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackLink, Button, T } from '../components/ui';
import { Line, OutlineButton, Plus, SearchGlyph, SectionLabel, Stamp } from '../components/form';
import { useToast } from '../components/Toast';
import { addEntry, loadEntries, newMilestones, parseStamp, stampTime } from '../lib/entries';
import { storage } from '../lib/storage';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

// Quick Scribble / New · Edit Location · Edit Timestamp (Figma 2012:4953 / 5025 / 5109)
export default function QuickScribble() {
  const { colors, season } = useTheme();
  const toast = useToast();
  const { note: preset } = useLocalSearchParams<{ note?: string }>();
  const [when, setWhen] = useState(new Date().toISOString());
  const [place, setPlace] = useState('');
  const [coords, setCoords] = useState('');
  const [note, setNote] = useState(preset ?? '');
  const [name, setName] = useState('');
  const [edit, setEdit] = useState<'time' | 'place' | null>(null);
  const [day, setDay] = useState(''); const [hour, setHour] = useState('');
  const [draftPlace, setDraftPlace] = useState(''); const [draftCoords, setDraftCoords] = useState('');
  const [busy, setBusy] = useState(false);

  // Start from the last place used — most scribbles happen on the same patch.
  useEffect(() => { storage.get<string>('ojiugo.lastPlace', '').then(setPlace); }, []);

  const saveTime = () => {
    const iso = parseStamp(day, hour, when);
    if (!iso) return toast({ text: 'that date looks off — try dd:mm:yyyy and 00:00' });
    setWhen(iso); setEdit(null);
  };
  const savePlace = () => { setPlace(draftPlace.trim()); setCoords(draftCoords.trim()); setEdit(null); };

  const save = async (fuller = false) => {
    if (!note.trim() && !name.trim()) return toast({ text: 'jot a few words first — anything will do' });
    setBusy(true);
    const before = await loadEntries();
    const entry = await addEntry({
      kind: fuller ? 'entry' : 'scribble', createdAt: when, place: place || undefined, coords: coords || undefined,
      note: note.trim() || undefined, species: name.trim() || undefined, namedByUser: !!name.trim(), season,
    });
    if (place) await storage.set('ojiugo.lastPlace', place);
    const earned = newMilestones(before, [...before, entry]);
    setBusy(false);
    const next = fuller ? `/write?id=${entry.id}` : '/scribble-saved';
    if (earned.length) router.replace({ pathname: '/milestone', params: { id: earned[0], next } });
    else router.replace(next as never);
  };

  const card = { backgroundColor: colors.surfacePage, borderRadius: radius.xl, padding: space.lg, gap: space.md };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: space.sm }}>
          <BackLink />
          <T v="displayLg">quick scribble</T>
          <T v="bodyLg" color={colors.textSubtle}>jot it down now, fill it in later</T>
        </View>

        <View style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T v="caption" color={colors.textSubtle} style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.4 }}>stamped for you</T>
            <T v="ui" color={colors.textSubtle}>tap a stamp to edit</T>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            <Stamp label={stampTime(when)} active={edit === 'time'} onPress={() => setEdit(edit === 'time' ? null : 'time')} />
            <Stamp label={place || 'add a place'} active={edit === 'place'} onPress={() => { setDraftPlace(place); setDraftCoords(coords); setEdit(edit === 'place' ? null : 'place'); }} />
          </View>
          {edit === 'place' ? (
            <View style={card}>
              <T v="overline" color={colors.textSubtle}>fix your location</T>
              <Line value={draftPlace} onChangeText={setDraftPlace} placeholder="name the spot" />
              <Line value={draftCoords} onChangeText={setDraftCoords} placeholder="search precise coordinates" right={<SearchGlyph color={colors.iconSubtle} />} />
              <SmallButton title="save changes" onPress={savePlace} />
            </View>
          ) : null}
          {edit === 'time' ? (
            <View style={card}>
              <T v="overline" color={colors.textSubtle}>choose your own time stamp</T>
              <Line value={day} onChangeText={setDay} placeholder="dd:mm:yyyy" keyboardType="numbers-and-punctuation" />
              <Line value={hour} onChangeText={setHour} placeholder="00:00" keyboardType="numbers-and-punctuation" />
              <SmallButton title="save changes" onPress={saveTime} />
            </View>
          ) : null}
        </View>

        <View style={{ gap: space.xs }}>
          <SectionLabel>what did you see?</SectionLabel>
          <Line value={note} onChangeText={setNote} placeholder="a quick note is enough" multiline />
        </View>

        <View style={{ gap: space.xs }}>
          <SectionLabel note="completely fine if not">know its name?</SectionLabel>
          <Line value={name} onChangeText={setName} placeholder="it’s fine not to know" autoCapitalize="words" />
          <T v="caption" color={colors.textSubtle} style={{ marginTop: space.xs }}>birds with no name land in the diary as a mystery bird — ID it any time</T>
        </View>

        <View style={{ flex: 1 }} />
        <View style={{ gap: space.md }}>
          <Button title="save scribble" onPress={() => save(false)} loading={busy} />
          <OutlineButton title="tell the fuller story" onPress={() => save(true)} icon={<Plus color={colors.iconDefault} />} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SmallButton({ title, onPress }: { title: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ alignSelf: 'flex-start', height: 44, paddingHorizontal: space.xl, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: pressed ? colors.actionPrimaryPressed : colors.actionPrimary })}>
      <T v="button" color={colors.textOnPrimary}>{title}</T>
    </Pressable>
  );
}
