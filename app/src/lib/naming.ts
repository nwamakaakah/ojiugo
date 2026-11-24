import { router } from 'expo-router';
import { loadEntries, newMilestones, updateEntry, type Entry } from './entries';

/** Name a mystery bird yourself, then celebrate (and award any milestone). */
export async function nameMystery(e: Entry, species: string) {
  const before = await loadEntries();
  await updateEntry(e.id, { species, wasMystery: true, namedByUser: !e.suggestion || e.suggestion.species !== species });
  const earned = newMilestones(before, await loadEntries());
  const next = `/mystery-result?id=${e.id}&found=1`;
  if (earned.length) router.replace({ pathname: '/milestone', params: { id: earned[0], next } });
  else router.replace(next as never);
}

