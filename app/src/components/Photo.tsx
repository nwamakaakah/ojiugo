import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

export type Focus = { x: number; y: number };

/**
 * A bird photo that fills its frame without losing the bird: it crops around the spot the birder
 * tapped (the "focus") instead of always cutting from the middle.
 */
export function Photo({ uri, focus, style, fit = 'cover' }: { uri: string; focus?: Focus; style?: StyleProp<ImageStyle>; fit?: 'cover' | 'contain' }) {
  const f = focus ?? { x: 0.5, y: 0.5 };
  return (
    <Image source={{ uri }} style={style} contentFit={fit} transition={160}
      contentPosition={{ left: `${Math.round(f.x * 100)}%`, top: `${Math.round(f.y * 100)}%` }}
      accessibilityIgnoresInvertColors />
  );
}
