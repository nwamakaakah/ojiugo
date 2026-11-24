import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { eyeSvg } from './svgs';

export function EyeLogo({ size = 120 }: { size?: number }) {
  return <SvgXml xml={eyeSvg} width={size} height={size * (39 / 47)} />;
}

// Loading leaves — redrawn from "Onboarding / Loading"
const leaf = (cx: number, cy: number, rot: number, fill: string, stroke: string) =>
  `<g transform="translate(${cx} ${cy}) rotate(${rot})"><path d="M-22 0C-12-9 12-9 22 0C12 9-12 9-22 0Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/><path d="M-18 0C-6 -1 6-1 18 0" stroke="${stroke}" stroke-width=".8" opacity=".5"/></g>`;
const leavesXml = `<svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
${leaf(30, 45, -62, '#c4703f', '#854e2c')}${leaf(62, 30, -70, '#96a186', '#575f47')}${leaf(98, 34, 18, '#9ca490', '#575f47')}
${leaf(40, 88, 6, '#cf8c64', '#854e2c')}${leaf(100, 80, -68, '#d3b479', '#886e3d')}${leaf(118, 70, -60, '#c9a35a', '#886e3d')}</svg>`;

/** Loading spins gently; elsewhere the leaves sway a touch, like a breeze. */
export function Leaves({ size = 140, spin = true }: { size?: number; spin?: boolean }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration: spin ? 1200 : 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(v);
  }, [spin, v]);
  const style = useAnimatedStyle(() => {
    const a = spin ? 6 : 2.2;
    return { transform: [{ translateY: size * 0.3 }, { rotate: `${-a + v.value * a * 2}deg` }, { translateX: spin ? 0 : -1.5 + v.value * 3 }, { translateY: -size * 0.3 }] };
  });
  return <Animated.View style={[{ width: size, height: size * (120 / 140) }, style]}><SvgXml xml={leavesXml} width={size} height={size * (120 / 140)} /></Animated.View>;
}

// Sparkles — "you're all set". Each star twinkles on its own beat.
const STAR = 'M0-20C2-6 6-2 20 0C6 2 2 6 0 20C-2 6-6 2-20 0C-6-2-2-6 0-20Z';
const starXml = `<svg viewBox="-22 -22 44 44" xmlns="http://www.w3.org/2000/svg"><path d="${STAR}" fill="#d3b479" stroke="#886e3d" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const dotsXml = `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"><circle cx="102" cy="22" r="4" fill="#96a186"/><circle cx="60" cy="64" r="4" fill="#c4703f"/><circle cx="12" cy="82" r="3.5" fill="#a45f35"/><circle cx="72" cy="78" r="3" fill="#d3b479"/></svg>`;
const STARS = [{ x: 28, y: 52, s: 0.75, d: 0 }, { x: 78, y: 32, s: 1, d: 700 }, { x: 128, y: 58, s: 0.62, d: 1300 }];

function Twinkle({ k, x, y, s, d }: { k: number; x: number; y: number; s: number; d: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(d, withRepeat(withSequence(
      withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 900 }),
    ), -1));
    return () => cancelAnimation(v);
  }, [d, v]);
  const style = useAnimatedStyle(() => ({ opacity: 0.55 + v.value * 0.45, transform: [{ scale: 0.9 + v.value * 0.14 }, { rotate: `${v.value * 12}deg` }] }));
  const size = 44 * s * k;
  return <Animated.View style={[{ position: 'absolute', left: (x - 22 * s) * k, top: (y - 22 * s) * k, width: size, height: size }, style]}><SvgXml xml={starXml} width={size} height={size} /></Animated.View>;
}

export function Sparkles({ width = 180 }: { width?: number }) {
  const k = width / 160;
  return (
    <View style={{ width, height: width * (90 / 160) }}>
      <SvgXml xml={dotsXml} width={width} height={width * (90 / 160)} style={{ position: 'absolute' }} />
      {STARS.map((st, i) => <Twinkle key={i} k={k} {...st} />)}
    </View>
  );
}

// Bird peeking over a branch — "Entries / Empty State"
const birdXml = `<svg viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg">
<path d="M58 78C58 44 80 28 110 28s52 16 52 50Z" fill="#8a6440" stroke="#5c3d22" stroke-width="2"/>
<circle cx="94" cy="56" r="7" fill="#fdfaf1"/><circle cx="95" cy="57" r="4" fill="#221d17"/>
<circle cx="126" cy="56" r="7" fill="#fdfaf1"/><circle cx="127" cy="57" r="4" fill="#221d17"/>
<path d="M104 66l6 9 6-9Z" fill="#d3b479" stroke="#886e3d" stroke-width="1.2"/>
<path d="M6 80h208" stroke="#5c3d22" stroke-width="6" stroke-linecap="round"/></svg>`;
export function PeekingBird({ width = 220 }: { width?: number }) {
  return <SvgXml xml={birdXml} width={width} height={width * (90 / 220)} />;
}

// Calls / Empty State — a round bird asleep on a branch.
const sleepyXml = `<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg">
<path d="M6 96c60-4 150-5 228-6" stroke="#8a6a4c" stroke-width="4" stroke-linecap="round" fill="none"/>
<ellipse cx="116" cy="70" rx="38" ry="27" fill="#8a6a4c" stroke="#b67a3f" stroke-width="3"/>
<path d="M96 56c12-6 32-6 44 2" stroke="#c98b4a" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M138 60l9-2-6 7" fill="#c98b4a"/>
<path d="M107 66c3-4 8-4 11 0" stroke="#221d17" stroke-width="2.6" fill="none" stroke-linecap="round"/>
<text x="150" y="38" font-family="Georgia, serif" font-size="18" fill="#8a6a4c">z</text>
<text x="162" y="24" font-family="Georgia, serif" font-size="12" fill="#8a6a4c">z</text></svg>`;
export function SleepingBird({ width = 240 }: { width?: number }) {
  return <SvgXml xml={sleepyXml} width={width} height={width * (110 / 240)} />;
}

// Collection / Empty State — an empty nest bowl.
const bowlXml = `<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg">
<path d="M8 26c30-18 174-18 204 0-6 44-46 74-102 74S14 70 8 26Z" fill="#e9e3d3" stroke="#8a6a4c" stroke-width="5" stroke-linejoin="round"/>
<path d="M10 28c40 10 160 10 200-2" stroke="#c98b4a" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M22 40c30 14 90 16 150 6" stroke="#8a6a4c" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M14 54c26 6 60 8 98 6" stroke="#8a6a4c" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
export function EmptyNest({ width = 210 }: { width?: number }) {
  return <SvgXml xml={bowlXml} width={width} height={width * (110 / 220)} />;
}
