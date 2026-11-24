import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Press as Pressable } from './Press';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { type } from '../theme/tokens';
import { T, roomy } from './ui';
import { Icon } from './Icon';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

// "Bottom Navigation" component from Figma.
// Colours: bar = nav/glass-fill, + button = action/primary with a surface/page ring,
// labels = text/light (idle) and text/default (active), active pill = action/primary.
type Key = 'entries' | 'flocks' | 'calls' | 'me';
const ROUTES: Record<Key, string> = { entries: '/entries', flocks: '/flocks', calls: '/calls', me: '/me' };
// Horizontal centres as a share of the bar width, measured from the Figma component (393pt wide).
const X: Record<Key | 'fab', number> = { entries: 0.127, fab: 0.308, flocks: 0.517, calls: 0.705, me: 0.89 };

const BAR = 67;       // bar height above the safe area
const FAB = 60;       // + button incl. its 4pt ring
const FAB_TOP = -15;  // how far the + rises above the bar
const NOTCH_HALF = 64;
const NOTCH_DEPTH = 51;
const MARK_TOP = 46;  // the active marker sits just under the lifted label

// Each tab screen draws its own bar, so remember which tab we came from;
// the new bar then glides the marker over from there, as if it were one bar.
let lastTab: Key | null = null;
const glide = { duration: 260, easing: Easing.out(Easing.cubic) };

export function TabBar({ active }: { active: Key }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(393);
  const h = BAR + insets.bottom;
  const cx = w * X.fab;
  const l = cx - NOTCH_HALF, r = cx + NOTCH_HALF;
  const d = `M0 0 H${l} C${l + 24} 0 ${cx - 40} ${NOTCH_DEPTH} ${cx} ${NOTCH_DEPTH} C${cx + 40} ${NOTCH_DEPTH} ${r - 24} 0 ${r} 0 H${w} V${h} H0 Z`;

  // the + gives a quarter turn and springs back as the scribble page rises in
  const spin = useSharedValue(0);
  const plusStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const add = () => { spin.value = withSequence(withTiming(90, { duration: 160 }), withSpring(0, { damping: 8 })); router.push('/scribble'); };

  const from = lastTab ?? active;
  const at = useSharedValue(X[from]);          // marker centre, as a share of the bar width
  const lift = useSharedValue(from === active ? 1 : 0);
  useEffect(() => {
    at.value = withTiming(X[active], glide);
    lift.value = withTiming(1, glide);
    lastTab = active;
  }, [active, at, lift]);
  const markStyle = useAnimatedStyle(() => ({ transform: [{ translateX: at.value * w - 20 }] }), [w]);
  const ink = { off: colors.textLight, on: colors.textDefault };
  const activeLabel = useAnimatedStyle(() => ({
    color: interpolateColor(lift.value, [0, 1], [ink.off, ink.on]),
    transform: [{ translateY: (1 - lift.value) * 4 }],
  }));

  const tab = (k: Key) => {
    const on = active === k;
    return (
      <Pressable key={k} haptic sink={0.97} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={k} hitSlop={8}
        onPress={() => !on && router.replace(ROUTES[k])}
        style={[styles.tab, { left: w * X[k] - 40, top: on ? 16 : 20 }]}>
        {on
          ? <Animated.Text maxFontSizeMultiplier={1.2} style={[styles.label, activeLabel]}>{k}</Animated.Text>
          : <T v="bodyLg" color={colors.textLight}>{k}</T>}
      </Pressable>
    );
  };

  return (
    <View style={{ height: h }} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="tablist">
      <Svg width={w} height={h} style={[StyleSheet.absoluteFill, Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as object) : null]}>
        <Path d={d} fill={colors.navGlassFill} />
      </Svg>
      {tab('entries')}{tab('flocks')}{tab('calls')}{tab('me')}
      <Animated.View pointerEvents="none" style={[styles.mark, { backgroundColor: colors.actionPrimary }, markStyle]} />
      <Pressable haptic sink={0.96} accessibilityRole="button" accessibilityLabel="add an entry" onPress={add}
        style={({ pressed }) => [styles.fab, { left: cx - FAB / 2, top: FAB_TOP, borderColor: colors.surfacePage, backgroundColor: pressed ? colors.actionPrimaryPressed : colors.actionPrimary, shadowColor: colors.shadow }]}>
        <Animated.View style={plusStyle}><Icon name="plus" color={colors.textOnPrimary} size={26} /></Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: { position: 'absolute', width: 80, alignItems: 'center' },
  mark: { position: 'absolute', left: 0, top: MARK_TOP, width: 40, height: 8, borderRadius: 4 },
  label: { ...type.bodyLg, ...roomy(type.bodyLg) } as object,
  fab: { position: 'absolute', width: FAB, height: FAB, borderRadius: FAB / 2, borderWidth: 4, alignItems: 'center', justifyContent: 'center', shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
});
