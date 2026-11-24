import { router, useLocalSearchParams } from 'expo-router';
import { Celebrate } from '../components/Celebrate';
import { useEntry } from '../lib/entries';

// Entry / Rewrite Confirmation — Named · Mystery (Figma 2012:12904 / 12865)
export default function Rewritten() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const e = useEntry(id);
  return (
    <Celebrate title="page rewritten" sub="another feathered friend remembered"
      primary={{ title: 'view diary entry', onPress: () => router.replace({ pathname: '/entry', params: { id: id ?? '' } }) }}
      secondary={e?.species ? { title: 'learn about your bird', onPress: () => router.replace({ pathname: '/bird', params: { name: e.species! } }) } : undefined} />
  );
}
