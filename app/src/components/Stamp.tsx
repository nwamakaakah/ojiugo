import { SvgXml } from 'react-native-svg';
import { primitives } from '../theme/tokens';

export type StampColor = 'terracotta' | 'gold' | 'plum' | 'sage' | 'sky' | 'green';

/** Hand-drawn milestone stamp: a filled disc, a wobbly inner ring and a star. */
export function Stamp({ color, size = 28, ink = '#FDFAF1' }: { color: StampColor; size?: number; ink?: string }) {
  const fill = primitives[color]['600'];
  const edge = primitives[color]['800'];
  const xml = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="31" fill="${fill}" stroke="${edge}" stroke-width="1.5"/>
  <path d="M32 9.5c12.6-.4 22.8 9.6 22.4 22.6-.3 12.2-10.6 22.4-22.8 22.1C19.3 53.9 9.4 43.6 9.8 31.4 10.2 19.6 20.2 9.9 32 9.5Z" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M32 18.5l3.9 8.6 9.2.9-6.9 6.2 2 9.1-8.2-4.8-8 4.9 1.8-9.2-7-6.1 9.3-1Z" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linejoin="round"/>
</svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
}
