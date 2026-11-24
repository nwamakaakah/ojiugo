import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { T } from './ui';

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
  const plus = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${colors.textOnPrimary}" stroke-width="2.4" stroke-linecap="round"><path d="M12.2 4.6c-.2 4.9-.1 9.8.1 14.7"/><path d="M4.8 12.4c4.8-.3 9.6-.2 14.4.1"/></svg>`;

  const tab = (k: Key) => {
    const on = active === k;
    return (
      <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={k} hitSlop={8}
        onPress={() => !on && router.replace(ROUTES[k])}
        style={[styles.tab, { left: w * X[k] - 40, top: on ? 16 : 20 }]}>
        <T v="bodyLg" color={on ? colors.textDefault : colors.textLight}>{k}</T>
        {on ? <View style={[styles.mark, { backgroundColor: colors.actionPrimary }]} /> : null}
      </Pressable>
    );
  };

  return (
    <View style={{ height: h }} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="tablist">
      <Svg width={w} height={h} style={[StyleSheet.absoluteFill, Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as object) : null]}>
        <Path d={d} fill={colors.navGlassFill} />
      </Svg>
      {tab('entries')}{tab('flocks')}{tab('calls')}{tab('me')}
      <Pressable accessibilityRole="button" accessibilityLabel="add an entry" onPress={() => router.push('/scribble')}
        style={({ pressed }) => [styles.fab, { left: cx - FAB / 2, top: FAB_TOP, borderColor: colors.surfacePage, backgroundColor: pressed ? colors.actionPrimaryPressed : colors.actionPrimary, shadowColor: colors.shadow }]}>
        <SvgXml xml={plus} width={26} height={26} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: { position: 'absolute', width: 80, alignItems: 'center' },
  mark: { width: 40, height: 8, borderRadius: 4, marginTop: 4 },
  fab: { position: 'absolute', width: FAB, height: FAB, borderRadius: FAB / 2, borderWidth: 4, alignItems: 'center', justifyContent: 'center', shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
});
