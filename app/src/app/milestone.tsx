import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Screen, T } from '../components/ui';
import { Stamp } from '../components/Stamp';
import { MILESTONES, type MilestoneId } from '../lib/entries';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

// Milestone / Earned Confirmation (Figma 2012:9391…)
export default function Milestone() {
  const { colors } = useTheme();
  const { id = 'first-bird', next } = useLocalSearchParams<{ id?: MilestoneId; next?: string }>();
  const m = MILESTONES.find((x) => x.id === id) ?? MILESTONES[0];
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <Stamp color={m.colorKey} size={96} />
        <View style={{ alignItems: 'center', gap: space.xs }}>
          <T v="displayLg" style={{ fontSize: 26, lineHeight: 30 }}>milestone — {m.title}</T>
          <T v="bodySm" color={colors.textSubtle}>{m.done}</T>
        </View>
      </View>
      <Button title="done" arrow={false} onPress={() => (next ? router.replace(next as never) : router.canGoBack() ? router.back() : router.replace('/me'))} />
    </Screen>
  );
}
