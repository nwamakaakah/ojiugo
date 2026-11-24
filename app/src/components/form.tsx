import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { feelingColors, primitives, radius, space, type } from '../theme/tokens';
import type { Feeling } from '../lib/entries';
import { T } from './ui';

/** Toggle from the Figma "notifications" row: action/primary track, text/on-primary knob. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => onChange(!value)} hitSlop={8}
      style={[styles.track, { backgroundColor: value ? colors.actionPrimary : colors.softNeutralFill }]}>
      <View style={[styles.knob, { backgroundColor: value ? colors.textOnPrimary : colors.surfacePage, alignSelf: value ? 'flex-end' : 'flex-start' }]} />
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
      <TextInput {...p} onFocus={(e) => { setFocus(true); p.onFocus?.(e); }} onBlur={(e) => { setFocus(false); p.onBlur?.(e); }}
        placeholderTextColor={colors.textDisabled}
        style={[type.bodyLg as TextStyle, { flex: 1, color: colors.textDefault, paddingVertical: space.sm, outlineWidth: 0, outlineStyle: 'none', borderWidth: 0, minHeight: p.multiline ? 64 : undefined, textAlignVertical: 'top' } as unknown as TextStyle]} />
      {right}
    </View>
  );
}

export function SearchGlyph({ color, size = 24 }: { color: string; size?: number }) {
  const xml = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round"><path d="M11 3.4c4.3 0 7.6 3.1 7.5 7.2-.1 4-3.6 7.3-7.8 7.2C6.4 17.7 3.2 14.5 3.4 10.5 3.6 6.4 6.8 3.4 11 3.4Z"/><path d="M16 16.4c1.6 1.3 3 2.8 4.3 4.3"/></svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
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
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress}
      style={[styles.choice, { borderStyle: dashed ? 'dashed' : 'solid', borderColor: on && dashed ? colors.iconDefault : colors.borderDefault, backgroundColor: on ? fill : 'transparent' }]}>
      {code ? <T v="label" color={colors.textDefault}>{code}</T> : null}
      <T v="ui" color={on && !dashed ? colors.textOnPrimary : colors.textSubtle}>{label}</T>
    </Pressable>
  );
}

/** Feeling chip with its hand-drawn ring. */
export function FeelingChip({ feeling, on, onPress }: { feeling: Feeling; on: boolean; onPress?: () => void }) {
  const { appearance } = useTheme();
  const c = feelingColors(feeling, appearance);
  const ring = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${on ? c.onLabel : c.ring}" stroke-width="1.5" stroke-linecap="round"><path d="M12.4 3.2c4.9-.1 8.6 3.6 8.4 8.6-.2 4.6-3.9 8.3-8.5 8.2-4.7-.1-8.4-3.9-8.2-8.6.2-4.5 3.8-8.1 8.3-8.2"/></svg>`;
  return (
    <Pressable disabled={!onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={feeling} onPress={onPress}
      style={[styles.feel, { backgroundColor: on ? c.onFill : c.fill }]}>
      <SvgXml xml={ring} width={24} height={24} />
      <T v="ui" color={on ? c.onLabel : c.label}>{feeling}</T>
    </Pressable>
  );
}

/** Outline pill button (add another, tell the fuller story, sign out). */
export function OutlineButton({ title, onPress, icon }: { title: string; onPress: () => void; icon?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => [styles.outline, { borderColor: colors.borderDefault, opacity: pressed ? 0.6 : 1 }]}>
      {icon}<T v="button" color={colors.textSubtle}>{title}</T>
    </Pressable>
  );
}

export const Plus = ({ color }: { color: string }) => <SvgXml xml={`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"><path d="M12.2 4.6c-.2 4.9-.1 9.8.1 14.7"/><path d="M4.8 12.4c4.8-.3 9.6-.2 14.4.1"/></svg>`} width={20} height={20} />;
export const Feather = ({ color, size = 20 }: { color: string; size?: number }) => <SvgXml xml={`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"><path d="M5 19c3-6 7-10 13-14-1 6-4 11-10 13"/><path d="M5 19l5-6"/></svg>`} width={size} height={size} />;
export const Notebook = ({ color, size = 22 }: { color: string; size?: number }) => <SvgXml xml={`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"><rect x="5.5" y="3.5" width="13" height="17" rx="1.6"/><path d="M8.5 3.5v17M11 8.5h4.5M11 11.5h4.5"/></svg>`} width={size} height={size} />;

const styles = StyleSheet.create({
  track: { width: 46, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  knob: { width: 22, height: 22, borderRadius: 11 },
  line: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, gap: space.sm },
  stamp: { paddingHorizontal: space.lg, height: 40, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed' },
  choice: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, height: 40, borderRadius: radius.pill, borderWidth: 1 },
  feel: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingLeft: space.md, paddingRight: space.lg, height: 44, borderRadius: radius.pill },
  outline: { flexDirection: 'row', gap: space.sm, height: 64, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
