import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { Press as Pressable } from './Press';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { feelingColors, primitives, radius, space, type } from '../theme/tokens';
import type { Feeling } from '../lib/entries';
import { T } from './ui';
import { Boing } from './motion';
import { Icon } from './Icon';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';

/** Toggle from the Figma "notifications" row: action/primary track, text/on-primary knob. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { colors } = useTheme();
  const t = useDerivedValue(() => withSpring(value ? 1 : 0, { damping: 14, stiffness: 260 }), [value]);
  const off = colors.softNeutralFill, on = colors.actionPrimary, kOff = colors.surfacePage, kOn = colors.textOnPrimary;
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.value, [0, 1], [off, on]) }));
  // the knob slides across and squashes a little on the way, like a pebble rolling
  const knob = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [kOff, kOn]),
    transform: [{ translateX: t.value * 18 }, { scaleX: 1 + Math.sin(Math.PI * Math.min(Math.max(t.value, 0), 1)) * 0.25 }],
  }));
  return (
    <Pressable haptic sink={0.92} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => onChange(!value)} hitSlop={8}
      style={styles.track}>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 14 }, track]} />
      <Animated.View style={[styles.knob, knob]} />
    </Pressable>
  );
}

/** "KNOW ITS NAME? • completely fine if not" */
export function SectionLabel({ children, note, style }: { children: string; note?: string; style?: TextStyle }) {
  const { colors } = useTheme();
  return (
    <T v="label" color={colors.textLight} style={[{ textTransform: 'uppercase', letterSpacing: 0.4 }, style as TextStyle]}>
      {children}{note ? <T v="bodySm" color={colors.textLight} style={{ textTransform: 'none', letterSpacing: 0 }}>{`  •  ${note}`}</T> : null}
    </T>
  );
}

/** Borderless input sitting on a hairline, as in every diary form. */
export function Line({ right, style, ...p }: TextInputProps & { right?: ReactNode }) {
  const { colors } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={[styles.line, { borderBottomColor: focus ? colors.actionPrimary : colors.borderDefault }, style as ViewStyle]}>
      <TextInput maxFontSizeMultiplier={1.2} {...p} onFocus={(e) => { setFocus(true); p.onFocus?.(e); }} onBlur={(e) => { setFocus(false); p.onBlur?.(e); }}
        placeholderTextColor={colors.textDisabled}
        style={[type.bodyLg as TextStyle, { flex: 1, color: colors.textDefault, paddingVertical: space.sm, outlineWidth: 0, outlineStyle: 'none', borderWidth: 0, minHeight: p.multiline ? 64 : undefined, textAlignVertical: 'top' } as unknown as TextStyle]} />
      {right}
    </View>
  );
}

export function SearchGlyph({ color, size = 24 }: { color: string; size?: number }) {
  return <Icon name="search" color={color} size={size * 0.92} />;
}

/** Dashed "stamp" pill — today • 4:32 pm, midfield park, lone. */
export function Stamp({ label, onPress, active, style }: { label: string; onPress?: () => void; active?: boolean; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined}
      style={[styles.stamp, { borderColor: active ? colors.actionPrimary : colors.borderDefault, backgroundColor: active ? colors.surfacePage : 'transparent' }, style]}>
      <T v="ui" color={colors.textDefault}>{label}</T>
    </Pressable>
  );
}

/** Single/multi choice pill (size, count, season). */
export function Choice({ label, on, onPress, code }: { label: string; on: boolean; onPress: () => void; code?: string }) {
  const { colors } = useTheme();
  const dashed = !!code;
  const fill = dashed ? colors.softInteractiveFill : primitives.gold['700'];
  return (
    <Boing trigger={on}>
    <Pressable haptic accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress}
      style={[styles.choice, { borderStyle: dashed ? 'dashed' : 'solid', borderColor: on && dashed ? colors.iconDefault : colors.borderDefault, backgroundColor: on ? fill : 'transparent' }]}>
      {code ? <T v="label" color={colors.textDefault}>{code}</T> : null}
      <T v="ui" color={on && !dashed ? colors.textOnPrimary : colors.textSubtle}>{label}</T>
    </Pressable>
    </Boing>
  );
}

/** Feeling chip with its hand-drawn ring. */
export function FeelingChip({ feeling, on, onPress }: { feeling: Feeling; on: boolean; onPress?: () => void }) {
  const { appearance } = useTheme();
  const c = feelingColors(feeling, appearance);
  const ring = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${on ? c.onLabel : c.ring}" stroke-width="1.5" stroke-linecap="round"><path d="M12.4 3.2c4.9-.1 8.6 3.6 8.4 8.6-.2 4.6-3.9 8.3-8.5 8.2-4.7-.1-8.4-3.9-8.2-8.6.2-4.5 3.8-8.1 8.3-8.2"/></svg>`;
  return (
    <Boing trigger={on}>
    <Pressable haptic={!!onPress} disabled={!onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={feeling} onPress={onPress}
      style={[styles.feel, { backgroundColor: on ? c.onFill : c.fill }]}>
      <SvgXml xml={ring} width={24} height={24} />
      <T v="ui" color={on ? c.onLabel : c.label}>{feeling}</T>
    </Pressable>
    </Boing>
  );
}

/** Outline pill button (add another, tell the fuller story, sign out). */
export function OutlineButton({ title, onPress, icon }: { title: string; onPress: () => void; icon?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Pressable haptic accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => [styles.outline, { borderColor: colors.borderDefault, opacity: pressed ? 0.6 : 1 }]}>
      {icon}<T v="button" color={colors.textSubtle}>{title}</T>
    </Pressable>
  );
}

export const Plus = ({ color, size = 18 }: { color: string; size?: number }) => <Icon name="plus" color={color} size={size} />;
export const Feather = ({ color, size = 20 }: { color: string; size?: number }) => <Icon name="pen" color={color} size={size} />;
export const Notebook = ({ color, size = 22 }: { color: string; size?: number }) => <Icon name="book" color={color} size={size} />;

const styles = StyleSheet.create({
  track: { width: 46, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  knob: { width: 22, height: 22, borderRadius: 11 },
  line: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, gap: space.sm },
  stamp: { paddingHorizontal: space.lg, height: 40, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed' },
  choice: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, height: 40, borderRadius: radius.pill, borderWidth: 1 },
  feel: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingLeft: space.md, paddingRight: space.lg, height: 44, borderRadius: radius.pill },
  outline: { flexDirection: 'row', gap: space.sm, height: 64, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
