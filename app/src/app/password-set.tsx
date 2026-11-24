import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, T } from '../components/ui';
import { Sparkles } from '../components/illustrations';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

export default function PasswordSet() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <Sparkles width={190} />
        <View style={{ alignItems: 'center', gap: space.xs }}>
          <T v="displayLg" style={{ textAlign: 'center', fontSize: 26, lineHeight: 30 }}>you’re all set</T>
          <T v="bodyMd" color={colors.textSubtle}>your new lock is in place</T>
        </View>
      </View>
      <Button title="back to my diary" arrow={false} onPress={() => router.replace('/')} />
    </Screen>
  );
}
