import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { onEntriesChange, readRows, removeRow, saveRow, type Row } from './sync';
import type { Season } from '../theme/tokens';

export const FEELINGS = ['joyful', 'awe', 'calm', 'wonder', 'proud'] as const;
export type Feeling = (typeof FEELINGS)[number];
export const SIZES = ['tiny', 'small', 'medium', 'large', 'very large'] as const;
export const COUNTS = ['lone', 'a lovely pair', 'three is a crowd', 'a small charm', 'a whole flock'] as const;
export const BREEDING = [
  ['S', 'singing'], ['P', 'pair seen'], ['CN', 'carrying nest bits'], ['NB', 'nest building'],
  ['CF', 'carrying food'], ['FL', 'fledglings about'], ['H', 'in appropriate habitat'], ['F', 'flyover'],
  ['FY', 'feeding young'], ['T', 'territorial behaviour'], ['NY', 'nest with young'],
] as const;

/** One diary page — a quick scribble or a full entry. */
export type Entry = {
  id: string;
  kind: 'scribble' | 'entry';
  createdAt: string;      // when the bird was seen (ISO)
  species?: string;       // named species, if known
  namedByUser?: boolean;  // the birder named it themselves
  wasMystery?: boolean;   // logged as a mystery bird first, named later
  place?: string;
  coords?: string;
  photo?: string;
  note?: string;          // quick scribble note
  describe?: string;      // "describe the bird"
  more?: string;          // "care to say more?"
  size?: (typeof SIZES)[number];
  count?: (typeof COUNTS)[number];
  feelings?: Feeling[];
  breeding?: string[];    // codes, e.g. ['S', 'P']
  season?: Season;
  suggestion?: { species: string; source: 'photo' | 'sound' | 'notes' }; // ID suggestion for a mystery bird
  rejected?: string[];    // suggestions the birder said "not my bird" to
};

// Pages live on the phone first and sync to Supabase in the background (see ./sync).
export const loadEntries = async () => (await readRows()).map((e) => ({ kind: 'entry', ...e }) as Entry);

export async function addEntry(e: Omit<Entry, 'id'>) {
  const entry = { ...e, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` } as Entry;
  await saveRow(entry as unknown as Row);
  return entry;
}
export async function updateEntry(id: string, patch: Partial<Entry>) {
  const cur = (await loadEntries()).find((e) => e.id === id);
  if (cur) await saveRow({ ...cur, ...patch } as unknown as Row);
}
export async function deleteEntry(id: string) {
  await removeRow(id);
}
export const getEntry = async (id: string) => (await loadEntries()).find((e) => e.id === id);

export type MilestoneId = 'first-bird' | 'first-named' | 'mystery-solved' | 'dawn-chorus' | 'ten-feathers';
export const MILESTONES: { id: MilestoneId; title: string; earned: string; todo: string; done: string; colorKey: 'terracotta' | 'gold' | 'plum' | 'sage' | 'sky' }[] = [
  { id: 'first-bird', title: 'first bird', earned: 'your very first sighting', todo: 'enter a bird', done: 'you logged your very first sighting', colorKey: 'terracotta' },
  { id: 'first-named', title: 'first named', earned: 'you named a {species}', todo: 'name a bird on your own', done: 'you named a bird on your own', colorKey: 'gold' },
  { id: 'mystery-solved', title: 'mystery solved', earned: 'named a bird you saved earlier', todo: 'id a mystery bird', done: 'you named a bird you saved earlier', colorKey: 'plum' },
  { id: 'dawn-chorus', title: 'dawn chorus', earned: 'logged a bird before 7am', todo: 'log a bird before 7am', done: 'you logged a bird before 7am', colorKey: 'sage' },
  { id: 'ten-feathers', title: 'ten feathers', earned: 'reached 10 species', todo: 'reach 10 species', done: 'you reached 10 species', colorKey: 'sky' },
];

export type Stats = {
  species: number; sightings: number; thisWeek: number;
  earned: Partial<Record<MilestoneId, { date: string; species?: string }>>;
};

export function computeStats(entries: Entry[], now = new Date()): Stats {
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const species = new Set<string>();
  const earned: Stats['earned'] = {};
  const weekAgo = now.getTime() - 7 * 864e5;
  let thisWeek = 0;
  for (const e of sorted) {
    if (new Date(e.createdAt).getTime() >= weekAgo) thisWeek++;
    earned['first-bird'] ??= { date: e.createdAt };
    if (e.species && e.namedByUser) earned['first-named'] ??= { date: e.createdAt, species: e.species };
    if (e.species && e.wasMystery) earned['mystery-solved'] ??= { date: e.createdAt };
    if (new Date(e.createdAt).getHours() < 7) earned['dawn-chorus'] ??= { date: e.createdAt };
    if (e.species) species.add(e.species.toLowerCase());
    if (species.size >= 10) earned['ten-feathers'] ??= { date: e.createdAt };
  }
  return { species: species.size, sightings: entries.length, thisWeek, earned };
}

/** Milestones earned by `after` that weren't earned by `before`. */
export function newMilestones(before: Entry[], after: Entry[]): MilestoneId[] {
  const a = computeStats(before).earned, b = computeStats(after).earned;
  return MILESTONES.map((m) => m.id).filter((id) => !a[id] && b[id]);
}

/** Reloads every time the screen comes into focus, so lists stay fresh after saving. */
export function useEntries() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  useFocusEffect(useCallback(() => { loadEntries().then(setEntries); }, []));
  // redraw live when a page changes here or arrives from another phone
  useEffect(() => onEntriesChange(() => { loadEntries().then(setEntries); }), []);
  return entries;
}
export function useStats() {
  const entries = useEntries();
  return computeStats(entries ?? []);
}
export function useEntry(id?: string) {
  const [entry, setEntry] = useState<Entry | null | undefined>(undefined);
  useFocusEffect(useCallback(() => { if (id) getEntry(id).then((e) => setEntry(e ?? null)); }, [id]));
  useEffect(() => (id ? onEntriesChange(() => { getEntry(id).then((e) => setEntry(e ?? null)); }) : undefined), [id]);
  useEffect(() => { if (!id) setEntry(null); }, [id]);
  return entry;
}

export type Species = { name: string; firstMet: string; seen: number; photo?: string; entries: Entry[] };
/** Group named entries into the "flocks" collection, newest species first. */
export function collection(entries: Entry[]): Species[] {
  const map = new Map<string, Species>();
  for (const e of [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (!e.species) continue;
    const k = e.species.toLowerCase();
    const s = map.get(k) ?? { name: e.species, firstMet: e.createdAt, seen: 0, entries: [] };
    s.seen++; s.entries.push(e); s.photo = s.photo ?? e.photo;
    map.set(k, s);
  }
  return [...map.values()].sort((a, b) => b.firstMet.localeCompare(a.firstMet));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Apr 12" */
export const shortDate = (iso: string) => { const d = new Date(iso); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; };
/** "Oct 2025" */
export const monthYear = (iso: string) => { const d = new Date(iso); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
/** "7 jul, 2026" */
export const longDate = (iso: string) => { const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()}, ${d.getFullYear()}`; };
/** "4:32 pm" */
export const clock = (iso: string) => { const d = new Date(iso); const h = d.getHours(); return `${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
/** "today • 4:32 pm" or "jul 3 • 4:32 pm" */
export const stampTime = (iso: string) => {
  const d = new Date(iso), now = new Date();
  const same = d.toDateString() === now.toDateString();
  return `${same ? 'today' : shortDate(iso).toLowerCase()} • ${clock(iso)}`;
};
/** Parse "dd:mm:yyyy" + "hh:mm" typed by the birder; returns ISO or undefined. */
export function parseStamp(date: string, time: string, fallback: string) {
  const base = new Date(fallback);
  const dm = date.trim().match(/^(\d{1,2})[:/.-](\d{1,2})[:/.-](\d{4})$/);
  const tm = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (date.trim() && !dm) return undefined;
  if (time.trim() && !tm) return undefined;
  const d = new Date(base);
  if (dm) d.setFullYear(+dm[3], +dm[2] - 1, +dm[1]);
  if (tm) d.setHours(+tm[1], +tm[2]);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}
