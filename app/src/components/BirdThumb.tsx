import { Image, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';

/** Square bird photo; a soft feather placeholder until the entry has a photo. */
export function BirdThumb({ uri, size = 58, r = radius.md }: { uri?: string; size?: number; r?: number }) {
  const { colors } = useTheme();
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: r }} accessibilityIgnoresInvertColors />;
  const feather = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${colors.iconSubtle}" stroke-width="1.3" stroke-linecap="round"><path d="M5 19c3-6 7-10 13-14-1 6-4 11-10 13"/><path d="M5 19l5-6"/></svg>`;
  return (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: colors.softNeutralFill, alignItems: 'center', justifyContent: 'center' }}>
      <SvgXml xml={feather} width={size * 0.42} height={size * 0.42} />
    </View>
  );
}
