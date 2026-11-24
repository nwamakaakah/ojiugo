import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

// Quiet, modern motion: short fades with a few points of travel, no bounce or spin.
// Reanimated honours the phone's "reduce motion" setting for all of these.

const ease = Easing.out(Easing.cubic);

const rise = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 6 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: ease },
}).duration(240);

const settle = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.96 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: ease },
}).duration(240);

// a rubber stamp pressed onto the page: comes down from a touch above, lands, settles
const stampDown = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 1.32 }, { rotate: '-10deg' }] },
  58: { opacity: 1, transform: [{ scale: 0.96 }, { rotate: '-2deg' }], easing: Easing.in(Easing.cubic) },
  80: { opacity: 1, transform: [{ scale: 1.02 }, { rotate: '0deg' }], easing: Easing.out(Easing.quad) },
  100: { opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }], easing: Easing.inOut(Easing.quad) },
}).duration(560);
/** ms after the start of StampIn when the stamp touches the paper */
export const STAMP_LANDS = 325;

const fade = new Keyframe({ 0: { opacity: 0 }, 100: { opacity: 1, easing: ease } }).duration(220);

/** Fades up a few points. Pass `i` to stagger items in a list (lightly, first few only). */
export function Rise({ children, i = 0, delay = 0, style }: { children: ReactNode; i?: number; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={rise.delay(delay + Math.min(i, 6) * 30)} style={style}>{children}</Animated.View>;
}

/** Plain fade. */
export function Fade({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={fade.delay(delay)} style={style}>{children}</Animated.View>;
}

/** Fades in while settling from 96% to full size — illustrations, stats. */
export function Pop({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={settle.delay(delay)} style={style}>{children}</Animated.View>;
}

/** Milestone stamps: pressed gently onto the page like a rubber stamp. */
export function StampIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={stampDown.delay(delay)} style={style}>{children}</Animated.View>;
}

/** Kept for existing call sites; no idle motion. */
export function Float({ children, style }: { children: ReactNode; amount?: number; style?: StyleProp<ViewStyle> }) {
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Kept for existing call sites; selection feedback now comes from the press itself. */
export function Boing({ children, style }: { trigger: unknown; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Animated.View style={style}>{children}</Animated.View>;
}
