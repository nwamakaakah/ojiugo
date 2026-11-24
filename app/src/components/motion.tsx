import { useEffect, useRef, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn, FadeInDown, Keyframe, ZoomIn, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, Easing,
} from 'react-native-reanimated';

// Small shared motion pieces. Reanimated honours the phone's "reduce motion" setting for all of these.

/** Rises into place a beat after the screen opens. Pass `i` to stagger items in a list. */
export function Rise({ children, i = 0, delay = 0, style }: { children: ReactNode; i?: number; delay?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay + Math.min(i, 10) * 45).springify().damping(18).stiffness(180)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Fades in without moving — for whole screens' secondary content. */
export function Fade({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={FadeIn.delay(delay).duration(320)} style={style}>{children}</Animated.View>;
}

/** Pops in with a little overshoot and tilt — stamps, illustrations, badges. */
export function Pop({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={ZoomIn.delay(delay).springify().damping(9).stiffness(160)} style={style}>{children}</Animated.View>;
}

/** Bobs gently up and down forever, like something resting on a breeze. */
export function Float({ children, amount = 6, style }: { children: ReactNode; amount?: number; style?: StyleProp<ViewStyle> }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(600, withRepeat(withSequence(
      withTiming(-amount, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
    ), -1));
  }, [amount, y]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** Gives a quick springy "boing" whenever `trigger` changes (e.g. a chip being picked). */
export function Boing({ trigger, children, style }: { trigger: unknown; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const s = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    s.value = withSequence(withTiming(1.1, { duration: 90 }), withSpring(1, { damping: 6, stiffness: 300 }));
  }, [trigger, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** A stamp being pressed onto the page: drops in big and spun, lands with a thump. */
const stamping = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 2.2 }, { rotate: '-28deg' }] },
  55: { opacity: 1, transform: [{ scale: 0.92 }, { rotate: '6deg' }] },
  75: { transform: [{ scale: 1.06 }, { rotate: '-3deg' }] },
  100: { transform: [{ scale: 1 }, { rotate: '0deg' }] },
}).duration(720);
export function StampIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={stamping.delay(delay)} style={style}>{children}</Animated.View>;
}
