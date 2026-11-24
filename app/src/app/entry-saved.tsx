import { router, useLocalSearchParams } from 'expo-router';
import { Celebrate } from '../components/Celebrate';
import { useEntry } from '../lib/entries';

// Entry / Saved Confirmation — Named Bird · Mystery Bird (Figma 2012:6374 / 6415)
export default function EntrySaved() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const e = useEntry(id);
  return (
    <Celebrate title="saved to your diary" sub="another feathered friend remembered"
      primary={{ title: 'view diary entry', onPress: () => router.replace({ pathname: '/entry', params: { id: id ?? '' } }) }}
      secondary={e?.species ? { title: 'learn about your bird', onPress: () => router.replace({ pathname: '/bird', params: { name: e.species! } }) } : undefined} />
  );
}
