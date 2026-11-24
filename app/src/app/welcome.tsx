import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, T } from '../components/ui';
import { EyeLogo } from '../components/illustrations';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

export default function Welcome() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <EyeLogo size={150} />
        <View style={{ alignItems: 'center', gap: space.xs }}>
          <T v="displayLg" style={{ textAlign: 'center' }}>ọjịugo</T>
          <T v="bodyMd" color={colors.textSubtle} style={{ textAlign: 'center', maxWidth: 260 }}>your cosy little journal for every feathered friend you meet</T>
        </View>
      </View>
      <View style={{ gap: space.sm }}>
        <Button title="start a diary" onPress={() => router.push('/sign-up')} />
        <Button variant="ghost" title="i already have a diary - open it" onPress={() => router.push('/log-in')} />
      </View>
    </Screen>
  );
}
