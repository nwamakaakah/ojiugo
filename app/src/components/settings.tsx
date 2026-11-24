import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Press as Pressable } from './Press';
import { Toggle } from './form';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { T } from './ui';
import { Icon } from './Icon';

export function Chevron({ color }: { color: string }) {
  return <Icon name="chevron" color={color} size={8} rotate={-90} />;
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
      <View style={styles.radio}>
        {/* plain radio, as in the design (Settings / Theme 2012:12995): thin ring, solid sage dot when chosen */}
        <View style={[styles.ring, { borderColor: colors.iconSubtle }]}>
          {selected ? <View style={[styles.dot, { backgroundColor: colors.actionPrimary }]} /> : null}
        </View>
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
  radio: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 15, height: 15, borderRadius: 7.5 },
});
