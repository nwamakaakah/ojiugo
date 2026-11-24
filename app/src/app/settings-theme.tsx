import { View } from 'react-native';
import { BackLink, Screen, T } from '../components/ui';
import { Option } from '../components/settings';
import { useToast } from '../components/Toast';
import { appearanceForTime, useTheme, type LightMode } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

// Settings / Theme (Figma 2012:12996 / 13046) + "by the clock".
// Tapping a look switches the app straight away — no save button.
export default function ThemePicker() {
  const { lightMode, setLightMode } = useTheme();
  const toast = useToast();

  const pick = (mode: LightMode) => {
    if (mode === lightMode) return;
    setLightMode(mode);
    const now = mode === 'auto' ? appearanceForTime() : mode;
    toast({
      text: mode === 'auto' ? 'the look now follows the clock' : `${mode} theme turned on`,
      kind: now === 'lamplight' ? 'moon' : 'sun',
      tone: now === 'lamplight' ? 'warm' : 'primary',
    });
  };

  return (
    <Screen>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <T v="displayLg" style={{ fontSize: 26, lineHeight: 30 }}>choose the look</T>
      </View>
      <View style={{ gap: space.md, marginTop: space.xl }}>
        <Option title="By the clock" note="daylight 6am – lamplight 7pm" selected={lightMode === 'auto'} onPress={() => pick('auto')} />
        <Option title="Daylight" note="best for daytime birding" selected={lightMode === 'daylight'} onPress={() => pick('daylight')} />
        <Option title="Lamplight" note="best for nighttime birding" selected={lightMode === 'lamplight'} onPress={() => pick('lamplight')} />
      </View>
    </Screen>
  );
}
