import { forwardRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((s: PressableStateCallbackType) => StyleProp<ViewStyle>);
  /** how far it sinks when pressed (1 = not at all) */
  sink?: number;
  /** a light tap you can feel, for buttons that do something */
  haptic?: boolean;
};

/** Drop-in Pressable that sinks with a spring when touched and bounces back on release. */
export const Press = forwardRef<ComponentRef<typeof Pressable>, PressProps>(function Press({ style, sink = 0.96, haptic, onPressIn, onPressOut, onPress, disabled, ...rest }, ref) {
  const s = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const resolved = typeof style === 'function' ? style({ pressed, hovered: false } as PressableStateCallbackType) : style;
  return (
    <AnimatedPressable
      ref={ref}
      {...rest}
      disabled={disabled}
      onPressIn={(e) => { setPressed(true); s.value = withSpring(sink, { damping: 15, stiffness: 420 }); onPressIn?.(e); }}
      onPressOut={(e) => { setPressed(false); s.value = withSpring(1, { damping: 9, stiffness: 260 }); onPressOut?.(e); }}
      onPress={(e) => { if (haptic && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress?.(e); }}
      style={[resolved, anim]}
    />
  );
});
