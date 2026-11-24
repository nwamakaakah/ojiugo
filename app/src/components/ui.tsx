import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type TextStyle, type ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { Press as Pressable } from './Press';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, radius, space, type } from '../theme/tokens';
import { arrowSvg, backSvg } from './svgs';
import { Icon } from './Icon';

// Keeps text from being cut off on phones:
// - Mali and Caveat are tall fonts; a line height tighter than the letters clips their tops and tails on Android,
//   so every line gets at least ~1.25× its font size (Caveat 1.22×);
// - centred text stretches to its row (see below);
// - Android's extra font padding is switched off so text sits where the design puts it inside pills and buttons;
// - very large system text sizes are capped at 1.2× so labels still fit their pills.
export const MAX_SCALE = 1.2;
export function roomy(s: TextStyle): TextStyle {
  const fs = s.fontSize ?? 14;
  const min = Math.ceil(fs * (s.fontFamily === fonts.display ? 1.22 : 1.25));
  return {
    includeFontPadding: false,
    ...(s.lineHeight != null && s.lineHeight < min ? { lineHeight: min } : null),
    // centred text fills its row, so iOS can't measure it a hair too narrow and hide the last word on a clipped second line
    ...(s.textAlign === 'center' && s.alignSelf == null && s.position !== 'absolute' && s.width == null
      ? (typeof s.maxWidth === 'number' ? { alignSelf: 'center' as const, width: s.maxWidth } : { alignSelf: 'stretch' as const })
      : null),
  };
}

/** Arrow icons recoloured to the current theme. */
export function ArrowIcon({ color, back = false }: { color: string; back?: boolean }) {
  const xml = (back ? backSvg : arrowSvg).replace(/#fdfaf1|#2c261f/g, color);
  return <View style={back ? { transform: [{ rotate: '180deg' }] } : undefined}><SvgXml xml={xml} width={18} height={back ? 8.6 : 10} /></View>;
}

export function Screen({ children, scroll = false, style }: { children: ReactNode; scroll?: boolean; style?: ViewStyle }) {
  const { colors } = useTheme();
  const body = scroll
    ? <ScrollView contentContainerStyle={[styles.screenInner, style]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
    : <View style={[styles.screenInner, { flex: 1 }, style]}>{children}</View>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{body}</KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function T({ v = 'bodyMd', color, style, children, ...rest }: { v?: keyof typeof type; color?: string; style?: TextStyle | TextStyle[]; children: ReactNode; numberOfLines?: number; adjustsFontSizeToFit?: boolean; minimumFontScale?: number }) {
  const { colors } = useTheme();
  const flat = (StyleSheet.flatten([type[v] as TextStyle, style as TextStyle]) ?? {}) as TextStyle;
  return <Text maxFontSizeMultiplier={MAX_SCALE} {...rest} style={[type[v] as TextStyle, { color: color ?? colors.textDefault }, style as TextStyle, roomy(flat)]}>{children}</Text>;
}

export function BackLink({ label = 'back', onPress }: { label?: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/welcome')))} style={styles.back} hitSlop={12}>
      <ArrowIcon color={colors.iconDefault} back />
      <T v="ui" color={colors.textDefault}>{label}</T>
    </Pressable>
  );
}

export function Heading({ children, sub }: { children: ReactNode; sub?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space.xs }}>
      <T v="displayLg">{children}</T>
      {sub ? <T v="bodyMd" color={colors.textSubtle}>{sub}</T> : null}
    </View>
  );
}

export function Button({ title, onPress, disabled, loading, variant = 'primary', arrow = true, style }: {
  title: string; onPress?: () => void; disabled?: boolean; loading?: boolean; variant?: 'primary' | 'ghost'; arrow?: boolean; style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const off = disabled || loading;
  if (variant === 'ghost') {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} disabled={off} style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }, style]}>
        <T v="ui" color={colors.textDefault} style={{ textAlign: 'center' }}>{title}</T>
      </Pressable>
    );
  }
  return (
    <Pressable haptic
      accessibilityRole="button" accessibilityState={{ disabled: !!off }} onPress={onPress} disabled={off}
      style={({ pressed }) => [styles.btn, { backgroundColor: off ? colors.actionPrimaryDisabled : pressed ? colors.actionPrimaryPressed : colors.actionPrimary }, style]}
    >
      <T v="button" color={off ? colors.actionPrimaryDisabledLabel : colors.textOnPrimary}>{loading ? 'one moment…' : title}</T>
      {arrow && !loading ? <ArrowIcon color={off ? colors.actionPrimaryDisabledLabel : colors.textOnPrimary} /> : null}
    </Pressable>
  );
}

export function Field({ label, error, hint, secure, ...input }: TextInputProps & { label: string; error?: string; hint?: string; secure?: boolean }) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: space.sm }}>
      <T v="label" color={colors.textLight} style={{ textTransform: 'uppercase' }}>{label}</T>
      <View style={[styles.fieldRow, { borderBottomColor: error ? colors.textCritical : focused ? colors.actionPrimary : colors.borderDefault }]}>
        <TextInput maxFontSizeMultiplier={1.2}
          {...input}
          secureTextEntry={secure ? hidden : false}
          placeholderTextColor={colors.textDisabled}
          onFocus={(e) => { setFocused(true); input.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); input.onBlur?.(e); }}
          style={[type.bodyMd as TextStyle, styles.input, { color: colors.textDefault, outlineWidth: 0 }]}
        />
        {secure ? (
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'show password' : 'hide password'} onPress={() => setHidden(!hidden)} hitSlop={10}>
            <EyeToggle color={colors.iconDefault} off={hidden} />
          </Pressable>
        ) : null}
      </View>
      {error ? <T v="bodySm" color={colors.textCritical}>{error}</T> : hint ? <T v="bodySm" color={colors.textLight}>{hint}</T> : null}
    </View>
  );
}

function EyeToggle({ color, off }: { color: string; off: boolean }) {
  return off ? <Icon name="eyeSlash" color={color} size={22} /> : <Icon name="eye" color={color} size={18} />;
}

export function Divider({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.divider}>
      <View style={[styles.line, { backgroundColor: colors.borderSubtle }]} />
      <T v="caption" color={colors.textDisabled}>{label}</T>
      <View style={[styles.line, { backgroundColor: colors.borderSubtle }]} />
    </View>
  );
}

export function SocialRow({ onPress }: { onPress: (p: 'google' | 'apple') => void }) {
  const { colors } = useTheme();
  const google = `<svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;
  const apple = `<svg width="16" height="18" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path fill="${colors.iconDefault}" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`;
  return (
    <View style={styles.socialRow}>
      {(['google', 'apple'] as const).map((p) => (
        <Pressable key={p} accessibilityRole="button" onPress={() => onPress(p)} style={({ pressed }) => [styles.social, { borderColor: colors.borderDefault, opacity: pressed ? 0.7 : 1 }]}>
          <SvgXml xml={p === 'google' ? google : apple} width={p === 'google' ? 18 : 16} height={18} />
          <T v="button">{p === 'google' ? 'Google' : 'Apple'}</T>
        </Pressable>
      ))}
    </View>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.notice, { backgroundColor: colors.softWonderFill }]}><T v="bodySm" color={colors.textDefault}>{children}</T></View>;
}

const styles = StyleSheet.create({
  screenInner: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.lg, flexGrow: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start', paddingVertical: space.xs },
  btn: { height: 64, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.md },
  ghost: { paddingVertical: space.md },
  fieldRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingBottom: space.sm, gap: space.sm },
  input: { flex: 1, paddingVertical: 4, minHeight: 32, fontFamily: fonts.regular },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  line: { flex: 1, height: 1 },
  socialRow: { flexDirection: 'row', gap: space.md },
  social: { flex: 1, height: 48, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  notice: { borderRadius: radius.md, padding: space.md },
});
