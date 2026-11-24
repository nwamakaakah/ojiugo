import { router } from 'expo-router';
import { Celebrate } from '../components/Celebrate';

// Stamp / Saved Confirmation (Figma 2012:11998)
export default function StampSaved() {
  return <Celebrate title="saved to your photos" sub="your birdie card is ready to share" primary={{ title: 'done', onPress: () => router.back() }} />;
}
