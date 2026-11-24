import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen, T } from '../components/ui';
import { Leaves } from '../components/illustrations';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

export default function Loading() {
  const { colors } = useTheme();
  useEffect(() => { const t = setTimeout(() => router.replace('/entries'), 1800); return () => clearTimeout(t); }, []);
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <Leaves size={150} />
        <View style={{ alignItems: 'center', gap: space.xs }}>
          <T v="displayLg" style={{ fontSize: 26, lineHeight: 30 }}>ọjịugo</T>
          <T v="bodyMd" color={colors.textSubtle}>warming up the nest…</T>
        </View>
      </View>
    </Screen>
  );
}
