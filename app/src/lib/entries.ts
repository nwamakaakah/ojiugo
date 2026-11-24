import { useEffect, useState } from 'react';
import { storage } from './storage';

/** One diary page. The diary screens (quick scribble / full entry) will write these. */
export type Entry = {
  id: string;
  createdAt: string;      // when the bird was seen (ISO)
  species?: string;       // named species, if known
  namedByUser?: boolean;  // the birder named it themselves
  wasMystery?: boolean;   // logged as a mystery bird first, named later
};

const KEY = 'ojiugo.entries';
export const loadEntries = () => storage.get<Entry[]>(KEY, []);

export type MilestoneId = 'first-bird' | 'first-named' | 'mystery-solved' | 'dawn-chorus' | 'ten-feathers';
export const MILESTONES: { id: MilestoneId; title: string; earned: string; todo: string; colorKey: 'terracotta' | 'gold' | 'plum' | 'sage' | 'sky' }[] = [
  { id: 'first-bird', title: 'first bird', earned: 'your very first sighting', todo: 'enter a bird', colorKey: 'terracotta' },
  { id: 'first-named', title: 'first named', earned: 'you named a {species}', todo: 'name a bird on your own', colorKey: 'gold' },
  { id: 'mystery-solved', title: 'mystery solved', earned: 'named a bird you saved earlier', todo: 'id a mystery bird', colorKey: 'plum' },
  { id: 'dawn-chorus', title: 'dawn chorus', earned: 'logged a bird before 7am', todo: 'log a bird before 7am', colorKey: 'sage' },
  { id: 'ten-feathers', title: 'ten feathers', earned: 'reached 10 species', todo: 'reach 10 species', colorKey: 'sky' },
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

export function useStats() {
  const [stats, setStats] = useState<Stats>(computeStats([]));
  useEffect(() => { loadEntries().then((e) => setStats(computeStats(e))); }, []);
  return stats;
}

/** "Apr 12" */
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }).split(' ').reverse().join(' ');
/** "Oct 2025" */
export const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
