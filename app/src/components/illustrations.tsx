import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { eyeSvg } from './svgs';
import * as Art from './illustrationArt';

export function EyeLogo({ size = 120 }: { size?: number }) {
  return <SvgXml xml={eyeSvg} width={size} height={size * (39 / 47)} />;
}

// Every empty state and celebration uses Nwamaka's own illustrations (Assets), each moving very gently.
// Loops are slow and small; Reanimated switches them off when the phone asks for reduced motion.
const loop = (v: { value: number }, ms: number, delay = 0) => {
  v.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }), -1, true));
};
const layer = { position: 'absolute' as const, left: 0, top: 0 };
/** rotate around a point given in the art's own units */
const around = (px: number, py: number, w: number, h: number, deg: number, k: number) =>
  [{ translateX: (px - w / 2) * k }, { translateY: (py - h / 2) * k }, { rotate: `${deg}deg` }, { translateX: -(px - w / 2) * k }, { translateY: -(py - h / 2) * k }];

// Loading / syncing — scattered leaves (222 × 148). Loading rocks them a little more; elsewhere they sway.
export function Leaves({ size = 140, spin = true }: { size?: number; spin?: boolean }) {
  const k = size / 222, h = 148 * k;
  const v = useSharedValue(0);
  useEffect(() => { loop(v, spin ? 1300 : 2600); return () => cancelAnimation(v); }, [spin, v]);
  const style = useAnimatedStyle(() => {
    const a = spin ? 5 : 2;
    return { transform: [...around(111, 140, 222, 148, -a + v.value * a * 2, k), { translateX: (spin ? 0 : -1.5 + v.value * 3) * k }] };
  });
  return <Animated.View style={[{ width: size, height: h }, style]}><SvgXml xml={Art.leavesXml} width={size} height={h} /></Animated.View>;
}

// Success — a nest held between two sprigs (285 × 160); the sprigs sway on their own beats.
export function LeafyNest({ width = 220 }: { width?: number }) {
  const k = width / 285, h = 160 * k;
  const l = useSharedValue(0), r = useSharedValue(0);
  useEffect(() => { loop(l, 2400); loop(r, 2400, 700); return () => { cancelAnimation(l); cancelAnimation(r); }; }, [l, r]);
  const left = useAnimatedStyle(() => ({ transform: around(70, 82, 285, 160, -3 + l.value * 6, k) }));
  const right = useAnimatedStyle(() => ({ transform: around(215, 82, 285, 160, 3 - r.value * 6, k) }));
  return (
    <View style={{ width, height: h }}>
      <Animated.View style={[layer, left]}><SvgXml xml={Art.dnLeftXml} width={width} height={h} /></Animated.View>
      <Animated.View style={[layer, right]}><SvgXml xml={Art.dnRightXml} width={width} height={h} /></Animated.View>
      <SvgXml xml={Art.dnNestXml} width={width} height={h} style={layer} />
    </View>
  );
}

// "You're all set" — stars and dots (223 × 103). Each star twinkles on its own beat.
const STARS = [{ xml: Art.star1Xml, cx: 27.5, cy: 48.8, d: 0 }, { xml: Art.star2Xml, cx: 129.4, cy: 35.5, d: 700 }, { xml: Art.star3Xml, cx: 200.4, cy: 75.4, d: 1300 }];
function Twinkle({ xml, cx, cy, d, k, w, h }: { xml: string; cx: number; cy: number; d: number; k: number; w: number; h: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(d, withRepeat(withSequence(
      withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 900 }),
    ), -1));
    return () => cancelAnimation(v);
  }, [d, v]);
  const style = useAnimatedStyle(() => {
    const s = 0.9 + v.value * 0.14;
    return {
      opacity: 0.6 + v.value * 0.4,
      transform: [{ translateX: (cx - 223 / 2) * k }, { translateY: (cy - 103 / 2) * k }, { scale: s }, { rotate: `${v.value * 12}deg` }, { translateX: -(cx - 223 / 2) * k }, { translateY: -(cy - 103 / 2) * k }],
    };
  });
  return <Animated.View style={[layer, style]}><SvgXml xml={xml} width={w} height={h} /></Animated.View>;
}
export function Sparkles({ width = 180 }: { width?: number }) {
  const k = width / 223, h = 103 * k;
  return (
    <View style={{ width, height: h }}>
      <SvgXml xml={Art.starDotsXml} width={width} height={h} style={layer} />
      {STARS.map((st, i) => <Twinkle key={i} {...st} k={k} w={width} h={h} />)}
    </View>
  );
}

// Entries / Empty State — a bird peeking over a branch (307 × 119). It bobs, tucking behind the
// branch, and every so often glances left, right and back.
export function PeekingBird({ width = 220 }: { width?: number }) {
  const k = width / 307, h = 119 * k;
  const bob = useSharedValue(0), look = useSharedValue(0);
  useEffect(() => {
    loop(bob, 1900);
    look.value = withRepeat(withSequence(
      withDelay(1600, withTiming(-1, { duration: 380, easing: Easing.out(Easing.quad) })),
      withDelay(900, withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) })),
      withDelay(900, withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) })),
    ), -1);
    return () => { cancelAnimation(bob); cancelAnimation(look); };
  }, [bob, look]);
  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (bob.value * 6 - 1) * k }] }));
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: look.value * 3.5 * k }] }));
  return (
    <View style={{ width, height: h }}>
      <View style={[layer, { width, height: 84 * k, overflow: 'hidden' }]}>
        <Animated.View style={[{ width, height: h }, bodyStyle]}>
          <SvgXml xml={Art.peekBodyXml} width={width} height={h} />
          <Animated.View style={[layer, eyeStyle]}><SvgXml xml={Art.peekEyesXml} width={width} height={h} /></Animated.View>
        </Animated.View>
      </View>
      <SvgXml xml={Art.peekBranchXml} width={width} height={h} style={layer} />
    </View>
  );
}

// Calls / Empty State — a round bird asleep on a branch (326 × 133). It breathes; its z's drift up.
function Zed({ xml, w, h, k, delay }: { xml: string; w: number; h: number; k: number; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2800, easing: Easing.out(Easing.quad) }), -1, false));
    return () => cancelAnimation(v);
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: v.value < 0.2 ? v.value * 5 : 1 - (v.value - 0.2) / 0.8,
    transform: [{ translateY: (8 - v.value * 22) * k }, { translateX: (-4 + v.value * 8) * k }],
  }));
  return <Animated.View style={[layer, style]}><SvgXml xml={xml} width={w} height={h} /></Animated.View>;
}
export function SleepingBird({ width = 240 }: { width?: number }) {
  const k = width / 326, h = 133 * k;
  const breath = useSharedValue(0);
  useEffect(() => { loop(breath, 2200); return () => cancelAnimation(breath); }, [breath]);
  // swells upward from where it sits, so it never lifts off the branch
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: (128 - 133 / 2) * k }, { scaleY: 1 + breath.value * 0.035 }, { scaleX: 1 + breath.value * 0.015 }, { translateY: -(128 - 133 / 2) * k }] }));
  return (
    <View style={{ width, height: h }}>
      <Animated.View style={[layer, style]}><SvgXml xml={Art.callBirdXml} width={width} height={h} /></Animated.View>
      <SvgXml xml={Art.callBranchXml} width={width} height={h} style={layer} />
      <Zed xml={Art.callZ1Xml} w={width} h={h} k={k} delay={0} />
      <Zed xml={Art.callZ2Xml} w={width} h={h} k={k} delay={1400} />
    </View>
  );
}

// Collection / Empty State — an empty nest (178 × 97), rocking a touch on its round bottom.
export function EmptyNest({ width = 210 }: { width?: number }) {
  const k = width / 178, h = 97 * k;
  const rock = useSharedValue(0);
  useEffect(() => { loop(rock, 2600); return () => cancelAnimation(rock); }, [rock]);
  const style = useAnimatedStyle(() => ({ transform: around(89, 88, 178, 97, -1.8 + rock.value * 3.6, k) }));
  return <Animated.View style={[{ width, height: h }, style]}><SvgXml xml={Art.nestXml} width={width} height={h} /></Animated.View>;
}
