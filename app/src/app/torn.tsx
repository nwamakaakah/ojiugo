import { router } from 'expo-router';
import { Celebrate } from '../components/Celebrate';

// Entry / Page Torn Confirmation (Figma 2012:12945)
export default function Torn() {
  return <Celebrate art="leaves" title="page torn out" sub="that page is now crumpled paper in a bin" primary={{ title: 'done', onPress: () => router.replace('/entries') }} />;
}
