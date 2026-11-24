import { SvgXml } from 'react-native-svg';
import * as I from './icons';

const RATIO = {eye: 1.2308, eyeSlash: 0.9327, circle: 1.0, book: 0.8981, camera: 0.9727, play: 0.8598, pen: 0.9808, search: 1.0265, plus: 1.0, chevron: 1.6617, arrow: 1.8159, back: 2.0978};
export type IconName = keyof typeof RATIO;

/** One of the hand-drawn icons exported from Figma, recoloured. `size` is the height. */
export function Icon({ name, color, size = 20, bg, rotate }: { name: IconName; color: string; size?: number; bg?: string; rotate?: number }) {
  const xml = (I as Record<string, string>)[`${name}Svg`].replace(/\{\{C\}\}/g, color).replace(/\{\{BG\}\}/g, bg ?? 'none');
  return <SvgXml xml={xml} width={size * RATIO[name]} height={size} style={rotate ? { transform: [{ rotate: `${rotate}deg` }] } : undefined} />;
}
