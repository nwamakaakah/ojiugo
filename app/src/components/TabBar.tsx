import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Press as Pressable } from './Press';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { T } from './ui';
import { Icon } from './Icon';
import Animated, { ZoomIn, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

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

export function TabBar({ active }: { active: Key }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(393);
  const h = BAR + insets.bottom;
  const cx = w * X.fab;
  const l = cx - NOTCH_HALF, r = cx + NOTCH_HALF;
  const d = `M0 0 H${l} C${l + 24} 0 ${cx - 40} ${NOTCH_DEPTH} ${cx} ${NOTCH_DEPTH} C${cx + 40} ${NOTCH_DEPTH} ${r - 24} 0 ${r} 0 H${w} V${h} H0 Z`;

  const spin = useSharedValue(0);
  const plusStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const add = () => { spin.value = withSequence(withTiming(90, { duration: 160 }), withSpring(0, { damping: 8 })); router.push('/scribble'); };

  const tab = (k: Key) => {
    const on = active === k;
    return (
      <Pressable key={k} haptic sink={0.9} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={k} hitSlop={8}
        onPress={() => !on && router.replace(ROUTES[k])}
        style={[styles.tab, { left: w * X[k] - 40, top: on ? 16 : 20 }]}>
        <T v="bodyLg" color={on ? colors.textDefault : colors.textLight}>{k}</T>
        {on ? <Animated.View entering={ZoomIn.springify().damping(10).stiffness(220)} style={[styles.mark, { backgroundColor: colors.actionPrimary }]} /> : null}
      </Pressable>
    );
  };

  return (
    <View style={{ height: h }} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="tablist">
      <Svg width={w} height={h} style={[StyleSheet.absoluteFill, Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as object) : null]}>
        <Path d={d} fill={colors.navGlassFill} />
      </Svg>
      {tab('entries')}{tab('flocks')}{tab('calls')}{tab('me')}
      <Pressable haptic sink={0.88} accessibilityRole="button" accessibilityLabel="add an entry" onPress={add}
        style={({ pressed }) => [styles.fab, { left: cx - FAB / 2, top: FAB_TOP, borderColor: colors.surfacePage, backgroundColor: pressed ? colors.actionPrimaryPressed : colors.actionPrimary, shadowColor: colors.shadow }]}>
        <Animated.View style={plusStyle}><Icon name="plus" color={colors.textOnPrimary} size={26} /></Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: { position: 'absolute', width: 80, alignItems: 'center' },
  mark: { width: 40, height: 8, borderRadius: 4, marginTop: 4 },
  fab: { position: 'absolute', width: FAB, height: FAB, borderRadius: FAB / 2, borderWidth: 4, alignItems: 'center', justifyContent: 'center', shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
});
