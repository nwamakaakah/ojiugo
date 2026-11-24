import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Screen, T } from './ui';
import { OutlineButton } from './form';
import { EmptyNest, Leaves, Sparkles } from './illustrations';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

/** Full-screen confirmation used across the diary flows (saved, rewritten, torn out, mystery solved…). */
export function Celebrate({ art = 'sparkles', title, sub, primary, secondary }: {
  art?: 'sparkles' | 'leaves' | 'nest';
  title: string; sub?: ReactNode;
  primary: { title: string; onPress: () => void };
  secondary?: { title: string; onPress: () => void; outline?: boolean };
}) {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        {art === 'sparkles' ? <Sparkles width={200} /> : art === 'leaves' ? <Leaves size={170} spin={false} /> : (
          <View style={{ alignItems: 'center' }}><Leaves size={150} spin={false} /><View style={{ marginTop: -70 }}><EmptyNest width={150} /></View></View>
        )}
        <View style={{ alignItems: 'center', gap: space.xs, paddingHorizontal: space.xl }}>
          <T v="displayLg" style={{ fontSize: 26, lineHeight: 30, textAlign: 'center' }}>{title}</T>
          {sub ? <T v="bodyMd" color={colors.textSubtle} style={{ textAlign: 'center' }}>{sub}</T> : null}
        </View>
      </View>
      <View style={{ gap: space.md }}>
        <Button title={primary.title} arrow={false} onPress={primary.onPress} />
        {secondary ? (secondary.outline
          ? <OutlineButton title={secondary.title} onPress={secondary.onPress} />
          : <Pressable accessibilityRole="button" onPress={secondary.onPress} style={{ alignSelf: 'center', padding: space.sm }}><T v="ui" color={colors.textSubtle}>{secondary.title}</T></Pressable>)
          : null}
      </View>
    </Screen>
  );
}
