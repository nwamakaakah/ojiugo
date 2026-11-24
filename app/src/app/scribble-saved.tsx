import { router } from 'expo-router';
import { Celebrate } from '../components/Celebrate';

// Quick Scribble / Saved Confirmation (Figma 2012:5190)
export default function ScribbleSaved() {
  return (
    <Celebrate title="scribble saved" sub="come back and make it a diary entry any time"
      primary={{ title: 'view scribble', onPress: () => router.replace('/scribbles') }}
      secondary={{ title: 'add another', outline: true, onPress: () => router.replace('/scribble') }} />
  );
}
