import { Photo } from './Photo';
import { StyleSheet, View } from 'react-native';
import { Press as Pressable } from './Press';
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { T } from './ui';
import { Rise } from './motion';
import { shortDate, type Entry } from '../lib/entries';
import { primitives, radius, sand, space } from '../theme/tokens';

const TONES = ['plum', 'rose', 'olive', 'clay'] as const;
const grass = `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round">
<g stroke="#4a3d2b" stroke-width="3"><path d="M40 120c-2-30 2-60 10-96"/><path d="M96 120c4-34 6-66 2-100"/><path d="M120 120c0-24 8-48 22-70"/><path d="M70 120c-8-20-20-36-40-46"/></g>
<g stroke="#96a186" stroke-width="2.4"><path d="M58 120c0-30 4-60 4-92"/><path d="M78 120c4-26 2-56-6-86"/><path d="M84 120c10-24 22-44 34-62"/></g>
<g fill="#d3b479"><ellipse cx="62" cy="26" rx="3" ry="7"/><ellipse cx="100" cy="20" rx="3" ry="7"/></g>
<g fill="#221d17"><circle cx="24" cy="70" r="2"/><circle cx="140" cy="54" r="2"/><circle cx="130" cy="70" r="2"/><circle cx="20" cy="84" r="2"/></g></svg>`;

/** Shelf card for one diary page (Figma: Entries / Grid View & List View). */
export function EntryCard({ entry, index, wide }: { entry: Entry; index: number; wide?: boolean }) {
  const tone = primitives[TONES[index % TONES.length]];
  return (
    <Rise i={index} style={[{ flex: 1 }, !wide && { maxWidth: '48.5%' }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${entry.species ?? 'mystery bird'}, ${shortDate(entry.createdAt)}`}
      onPress={() => router.push({ pathname: '/entry', params: { id: entry.id } })}
      style={[styles.card, { width: '100%', height: 200, backgroundColor: tone['600'] }]}>
      {entry.photo ? <Photo uri={entry.photo} focus={entry.photoFocus} style={StyleSheet.absoluteFill} />
        : <View style={styles.art}><SvgXml xml={grass} width="100%" height="100%" preserveAspectRatio="xMidYMax slice" /></View>}
      <View style={[styles.band, { backgroundColor: `${tone['700']}cc` }]}>
        <T v="label" color={sand['25']} numberOfLines={2}>{entry.species ?? 'Mystery bird'}</T>
        <T v="caption" color={sand['100']} numberOfLines={2}>{[shortDate(entry.createdAt), entry.place].filter(Boolean).join('  •  ')}</T>
      </View>
    </Pressable>
    </Rise>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  art: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 10 },
  band: { padding: space.md, gap: 2 },
});
