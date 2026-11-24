import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Toggle } from './form';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { T } from './ui';

export function Chevron({ color }: { color: string }) {
  return <SvgXml xml={`<svg viewBox="0 0 8 12" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 1.5 6.5 6 2 10.5"/></svg>`} width={7} height={11} />;
}

/** Overline + rounded card holding rows separated by hairlines. */
export function Group({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: space.sm }}>
      <T v="overline" color={colors.textLight}>{title}</T>
      <View style={[styles.card, { backgroundColor: colors.surfacePage }]}>
        {rows.map((r, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.borderSubtle }]} /> : null}
            {r}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

/** Label-above-value row; tappable rows get a chevron. */
export function Row({ label, value, onPress, title, sub }: { label?: string; value?: string; onPress?: () => void; title?: string; sub?: string }) {
  const { colors } = useTheme();
  const body = (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        {label ? <T v="caption" color={colors.textLight}>{label}</T> : null}
        {value ? <T v="bodySm" color={colors.textDefault}>{value}</T> : null}
        {title ? <T v="ui" color={colors.textDefault}>{title}</T> : null}
        {sub ? <T v="caption" color={colors.textLight}>{sub}</T> : null}
      </View>
      {onPress ? <Chevron color={colors.iconDefault} /> : null}
    </View>
  );
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.6 }}>{body}</Pressable> : body;
}

export function ToggleRow({ title, value, onChange }: { title: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <T v="ui" style={{ flex: 1 }}>{title}</T>
      <T v="caption" color={colors.textLight}>{value ? 'on' : 'off'}</T>
      <Toggle value={value} onChange={onChange} label={title} />
    </View>
  );
}

/** Radio option card used by "choose the look". */
export function Option({ title, note, selected, onPress }: { title: string; note: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress}
      style={[styles.option, { borderColor: selected ? colors.borderDefault : colors.borderSubtle, backgroundColor: colors.surfacePage }]}>
      <View style={[styles.radio, { borderColor: colors.iconDefault }]}>
        {selected ? <View style={[styles.dot, { backgroundColor: colors.actionPrimary }]} /> : null}
      </View>
      <T v="label" style={{ flex: 1 }}>{title}</T>
      <T v="caption" color={colors.textSubtle}>{note}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, paddingHorizontal: space.md },
  rule: { height: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.md, minHeight: 48 },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, height: 52, borderRadius: radius.md, borderWidth: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.4, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 13, height: 13, borderRadius: 7 },
});
