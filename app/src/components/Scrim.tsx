import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { useBlurTarget } from './BlurTarget';

/** Blurred, softly dimmed backdrop behind modals (fades in and out). */
export function Scrim() {
  const { colors, appearance } = useTheme();
  const target = useBlurTarget();
  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(180)} style={StyleSheet.absoluteFill} pointerEvents="none">
      <BlurView
        intensity={Platform.OS === 'ios' ? 24 : 40}
        tint={appearance === 'lamplight' ? 'dark' : 'light'}
        blurMethod="dimezisBlurView"
        blurTarget={target ?? undefined}
        blurReductionFactor={3}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlayScrim, opacity: 0.45 }]} />
    </Animated.View>
  );
}
