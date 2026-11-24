import { useEffect, type ReactNode } from 'react';
import { cue as play, type Cue } from '../lib/feedback';
import { View } from 'react-native';
import { Press as Pressable } from './Press';
import { Button, Screen, T } from './ui';
import { Float, Pop, Rise } from './motion';
import { OutlineButton } from './form';
import { EmptyNest, Leaves, Sparkles } from './illustrations';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

/** Full-screen confirmation used across the diary flows (saved, rewritten, torn out, mystery solved…). */
export function Celebrate({ art = 'sparkles', title, sub, primary, secondary, cue }: {
  art?: 'sparkles' | 'leaves' | 'nest';
  /** sound + haptic as the screen arrives; sparkles chirp by default */
  cue?: Cue | null;
  title: string; sub?: ReactNode;
  primary: { title: string; onPress: () => void };
  secondary?: { title: string; onPress: () => void; outline?: boolean };
}) {
  const { colors } = useTheme();
  const c = cue === undefined ? (art === 'sparkles' ? 'chirp' : null) : cue;
  useEffect(() => { if (!c) return; const t = setTimeout(() => play(c), 160); return () => clearTimeout(t); }, [c]);
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <Pop delay={0}><Float>
        {art === 'sparkles' ? <Sparkles width={200} /> : art === 'leaves' ? <Leaves size={170} spin={false} /> : (
          <View style={{ alignItems: 'center' }}><Leaves size={150} spin={false} /><View style={{ marginTop: -70 }}><EmptyNest width={150} /></View></View>
        )}
        </Float></Pop>
        <Rise delay={80} style={{ alignItems: 'center', gap: space.xs, paddingHorizontal: space.xl }}>
          <T v="displayLg" style={{ fontSize: 26, lineHeight: 30, textAlign: 'center' }}>{title}</T>
          {sub ? <T v="bodyMd" color={colors.textSubtle} style={{ textAlign: 'center' }}>{sub}</T> : null}
        </Rise>
      </View>
      <Rise delay={140} style={{ gap: space.md }}>
        <Button title={primary.title} arrow={false} onPress={primary.onPress} />
        {secondary ? (secondary.outline
          ? <OutlineButton title={secondary.title} onPress={secondary.onPress} />
          : <Pressable accessibilityRole="button" onPress={secondary.onPress} style={{ alignSelf: 'center', padding: space.sm }}><T v="ui" color={colors.textSubtle}>{secondary.title}</T></Pressable>)
          : null}
      </Rise>
    </Screen>
  );
}
