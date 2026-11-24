import { useRef, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View, type TextStyle } from 'react-native';
import { Press as Pressable } from './Press';
import { useTheme } from '../theme/ThemeProvider';
import { space, type } from '../theme/tokens';
import { T } from './ui';

/** Six underlined digit slots backed by one hidden input (works with SMS/email autofill). */
export function CodeInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const { colors } = useTheme();
  const ref = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityLabel="verification code">
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];
          const active = i === Math.min(value.length, length - 1);
          return (
            <View key={i} style={[styles.slot, { borderBottomColor: active ? colors.actionPrimary : colors.borderDefault }]}>
              <T v="label" color={ch ? colors.textDefault : colors.textDisabled}>{ch ?? '0'}</T>
            </View>
          );
        })}
      </View>
      <TextInput maxFontSizeMultiplier={1.2}
        ref={ref} value={value} autoFocus maxLength={length}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code"
        style={[type.bodyMd as TextStyle, styles.hidden]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md },
  slot: { flex: 1, alignItems: 'center', paddingVertical: space.sm, borderBottomWidth: 1 },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
