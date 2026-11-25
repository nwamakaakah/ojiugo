import { View } from 'react-native';
import { Photo, type Focus } from './Photo';
import { Icon } from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';

/** Square bird photo; a soft feather placeholder until the entry has a photo. */
export function BirdThumb({ uri, focus, size = 58, r = radius.md }: { uri?: string; focus?: Focus; size?: number; r?: number }) {
  const { colors } = useTheme();
  if (uri) return <Photo uri={uri} focus={focus} style={{ width: size, height: size, borderRadius: r }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: colors.softNeutralFill, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="pen" color={colors.iconSubtle} size={size * 0.4} />
    </View>
  );
}
