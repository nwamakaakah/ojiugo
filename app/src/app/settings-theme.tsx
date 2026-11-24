import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { BackLink, Button, Screen, T } from '../components/ui';
import { Option } from '../components/settings';
import { useToast } from '../components/Toast';
import { appearanceForTime, useTheme, type LightMode } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

// Settings / Theme (Figma 2012:12996 / 13046) + "by the clock"
export default function ThemePicker() {
  const { lightMode, setLightMode } = useTheme();
  const toast = useToast();
  const [pick, setPick] = useState<LightMode>(lightMode);

  const save = () => {
    setLightMode(pick);
    const now = pick === 'auto' ? appearanceForTime() : pick;
    toast({
      text: pick === 'auto' ? 'the look now follows the clock' : `${pick} theme turned on`,
      kind: now === 'lamplight' ? 'moon' : 'sun',
      tone: now === 'lamplight' ? 'warm' : 'primary',
    });
    router.back();
  };

  return (
    <Screen>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <T v="displayLg" style={{ fontSize: 26, lineHeight: 30 }}>choose the look</T>
      </View>
      <View style={{ gap: space.md, marginTop: space.xl }}>
        <Option title="By the clock" note="daylight 6am – lamplight 7pm" selected={pick === 'auto'} onPress={() => setPick('auto')} />
        <Option title="Daylight" note="best for daytime birding" selected={pick === 'daylight'} onPress={() => setPick('daylight')} />
        <Option title="Lamplight" note="best for nighttime birding" selected={pick === 'lamplight'} onPress={() => setPick('lamplight')} />
      </View>
      <View style={{ flex: 1 }} />
      <Button title="save look" arrow={false} onPress={save} disabled={pick === lightMode} />
    </Screen>
  );
}
