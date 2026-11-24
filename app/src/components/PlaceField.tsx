import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { T } from './ui';
import { Line } from './form';
import { Icon } from './Icon';
import { Press as Pressable } from './Press';
import { formatCoords, parseCoords, placeHere, searchPlaces, type Place } from '../lib/places';
import { storage } from '../lib/storage';
import { tick } from '../lib/feedback';

/**
 * "name the spot" with place search under it. Typing shows up to five matches; tapping one fills the
 * name and quietly keeps its coordinates. "use where I am now" asks the phone's GPS. Anything typed by
 * hand is kept as-is — birders name spots their own way.
 */
export function PlaceField({ place, coords, onChange }: {
  place: string; coords: string;
  onChange: (place: string, coords: string) => void;
}) {
  const { colors } = useTheme();
  const [focus, setFocus] = useState(false);
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState('');
  const [near, setNear] = useState<{ lat: number; lon: number } | null>(null);
  const typed = useRef(false);

  useEffect(() => { storage.get<string>('ojiugo.lastCoords', '').then((c) => setNear(parseCoords(c))); }, []);

  // search as they type (waits a beat so it isn't firing on every letter)
  useEffect(() => {
    if (!typed.current) return;
    const q = place.trim();
    if (q.length < 2) { setResults(null); return; }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      searchPlaces(q, near, ctl.signal)
        .then((r) => { setResults(r); setNote(''); })
        .catch((e) => { if (e?.name !== 'AbortError') { setResults([]); setNote('can’t search places right now — what you type is still saved'); } })
        .finally(() => setLoading(false));
    }, 300);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [place, near]);

  const pick = (p: Place) => {
    tick();
    const c = formatCoords(p.lat, p.lon);
    typed.current = false;
    onChange(p.name, c);
    storage.set('ojiugo.lastCoords', c);
    setResults(null); setFocus(false); setNote('');
  };

  const here = async () => {
    setLocating(true); setNote('');
    const r = await placeHere();
    setLocating(false);
    if (r.place) pick(r.place); else setNote(r.error ?? '');
  };

  const open = focus || !!results;
  const row = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: space.md, paddingVertical: space.md, paddingHorizontal: space.md };

  return (
    <View style={{ gap: space.xs }}>
      <Line value={place} placeholder="name the spot"
        onChangeText={(v) => { typed.current = true; onChange(v, ''); }}   // typed by hand: the old coordinates no longer belong to it
        onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
        right={loading ? <ActivityIndicator size="small" color={colors.iconSubtle} /> : <Icon name="pin" color={colors.iconSubtle} size={20} />} />
      {coords && !open ? <T v="bodySm" color={colors.textLight}>{coords}</T> : null}
      {open ? (
        <View style={{ borderRadius: radius.lg, backgroundColor: colors.surfacePage, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderSubtle }}>
          <Pressable accessibilityRole="button" onPress={here} disabled={locating} style={row}>
            {locating ? <ActivityIndicator size="small" color={colors.actionPrimary} /> : <Icon name="pin" color={colors.actionPrimary} size={20} />}
            <T v="label" color={colors.textInteractive}>{locating ? 'finding you…' : 'use where I am now'}</T>
          </Pressable>
          {(results ?? []).map((p, i) => (
            <Pressable key={`${p.name}-${p.lat}-${i}`} accessibilityRole="button" onPress={() => pick(p)}
              style={[row, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <T v="bodyMd">{p.name}</T>
                {p.area ? <T v="bodySm" color={colors.textLight}>{p.area}</T> : null}
              </View>
            </Pressable>
          ))}
          {results && !results.length && !note ? (
            <View style={[row, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}>
              <T v="bodySm" color={colors.textSubtle}>no matches — keep what you typed</T>
            </View>
          ) : null}
        </View>
      ) : null}
      {note ? <T v="bodySm" color={colors.textSubtle}>{note}</T> : null}
    </View>
  );
}
