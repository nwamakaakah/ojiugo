import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Screen, T } from '../components/ui';
import { Sparkles } from '../components/illustrations';
import { countryByName, seasonsSentence } from '../lib/countries';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

// Settings / Location Changed Confirmation (Figma 2012:10671)
export default function LocationSet() {
  const { colors } = useTheme();
  const { country = '' } = useLocalSearchParams<{ country?: string }>();
  const c = countryByName(country);
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <Sparkles width={190} />
        <View style={{ alignItems: 'center', gap: space.xs, paddingHorizontal: space.xl }}>
          <T v="displayLg" style={{ fontSize: 26, lineHeight: 30 }}>your location has changed</T>
          <T v="bodySm" color={colors.textSubtle} style={{ textAlign: 'center' }}>
            you’re birding in {country} now — so your seasons are {c ? seasonsSentence(c) : 'set'}
          </T>
        </View>
      </View>
      <Button title="back to my diary" arrow={false} onPress={() => router.dismissTo('/me')} />
    </Screen>
  );
}
