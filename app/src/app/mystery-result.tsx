import { router, useLocalSearchParams } from 'expo-router';
import { Celebrate } from '../components/Celebrate';
import { T } from '../components/ui';
import { shortDate, useEntry } from '../lib/entries';

// Mystery Bird / Identified · Not Found Confirmation (Figma 2012:12332 / 12380)
export default function MysteryResult() {
  const { id, found } = useLocalSearchParams<{ id?: string; found?: string }>();
  const e = useEntry(id);
  const done = { title: 'done', onPress: () => router.dismissTo('/calls') };
  if (found !== '1') return <Celebrate art="leaves" title="not your bird?" sub="no worries — we’ll keep our eyes open till we find it" primary={done} />;
  return (
    <Celebrate art="nest" title="mystery solved" primary={done}
      sub={<>your {e ? shortDate(e.createdAt).toLowerCase() : ''} bird was a <T v="label">{e?.species ?? ''}</T></>} />
  );
}
