import { Photo } from './Photo';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { T } from './ui';
import { BirdThumb } from './BirdThumb';
import { longDate, clock, type Entry } from '../lib/entries';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { eyeSvg } from './svgs';

// "Shared Page" (Figma 2012:11387), measured in design points on a 393 × 574 frame and scaled to fit.
// It follows the app's look: daylight is the design as drawn; lamplight uses the matching night colours.
const W = 393;
export type CardStyle = 'leafy' | 'torn';

// Two designs: "leafy" (Shared Page 2012:11387 — straight page over foliage) and "torn"
// (2012:11918 — torn-edged page on plain parchment). Positions in design points.
const LAYOUT = {
  leafy: { H: 574, page: { l: 16, t: 58, w: 360, h: 454 }, box: { l: 16, t: 64, w: 328, h: 204 }, foot: 525 },
  torn: { H: 539, page: { l: 18, t: 26, w: 357, h: 440 }, box: { l: 47, t: 64, w: 263, h: 204 }, foot: 488 },
} as const;

// A torn paper outline: small uneven teeth all the way round (fixed seed, so every card tears the same way).
function tornPath(w: number, h: number) {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pts: string[] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    for (let d = 0; d < len; ) {
      const t = d / len, depth = 2 + rnd() * 11;
      pts.push(`${(x0 + (x1 - x0) * t + nx * depth).toFixed(1)},${(y0 + (y1 - y0) * t + ny * depth).toFixed(1)}`);
      d += 6 + rnd() * 12;
    }
  };
  edge(0, 0, w, 0, 0, 1); edge(w, 0, w, h, -1, 0); edge(w, h, 0, h, 0, -1); edge(0, h, 0, 0, 1, 0);
  return `M${pts.join('L')}Z`;
}
const TORN = tornPath(LAYOUT.torn.page.w, LAYOUT.torn.page.h);
const DAY = {
  frame: '#F6F2E7', parchment: '#E8E3D6', page: '#FDFAF2', rule: '#EEE9DD', box: '#E9E3D7', tape: 'rgba(140,136,126,0.55)',
  ink: '#2C261F', soft: '#4A4239', dash: '#CFC8BA', foot: '#6E655B',
};
type Palette = typeof DAY;
function nightPalette(c: ReturnType<typeof useTheme>['colors']): Palette {
  return {
    frame: c.bgApp, parchment: c.bgDesk, page: c.surfacePage, rule: c.borderSubtle, box: c.softNeutralFill,
    tape: 'rgba(214,204,186,0.28)', ink: c.textDefault, soft: c.textSubtle, dash: c.borderDefault, foot: c.textLight,
  };
}
// the leaves on a see-through background, so they sit on either look's frame colour
const foliage = require('../../assets/images/share-foliage-clear.png');
const RULES = [40, 86, 132, 178, 224, 270, 316, 361, 407]; // ruled lines, from the top of the page

/** The shareable "meet my feathered friend" card. Give it the width it should fill. */
export function BirdieCard({ entry, blurb, width, look = 'leafy' }: { entry: Entry; blurb?: string; width?: number; look?: CardStyle }) {
  const { colors, appearance } = useTheme();
  const C = appearance === 'lamplight' ? nightPalette(colors) : DAY;
  const L = LAYOUT[look];
  const H = L.H;
  const [measured, setMeasured] = useState(W);
  const w = width ?? measured;
  const u = w / W;
  const text = blurb ?? entry.describe;
  return (
    <View onLayout={width ? undefined : (e) => setMeasured(e.nativeEvent.layout.width)}
      style={{ width: width ?? '100%', height: H * u, backgroundColor: look === 'torn' ? C.parchment : C.frame, overflow: 'hidden' }}>
      {look === 'leafy' ? <Image source={foliage} style={StyleSheet.absoluteFill} resizeMode="stretch" /> : null}

      {/* the page */}
      <View style={[{ position: 'absolute', left: L.page.l * u, top: L.page.t * u, width: L.page.w * u, height: L.page.h * u },
        look === 'leafy' && { backgroundColor: C.page, shadowColor: '#5A4A32', shadowOpacity: 0.12, shadowRadius: 6 * u, shadowOffset: { width: 0, height: 2 * u }, elevation: 3 }]}>
        {look === 'torn' ? (
          <SvgXml width={L.page.w * u} height={L.page.h * u} style={StyleSheet.absoluteFill} xml={`<svg viewBox="0 0 ${L.page.w} ${L.page.h}" xmlns="http://www.w3.org/2000/svg">
            <defs><clipPath id="t"><path d="${TORN}"/></clipPath></defs>
            <path d="${TORN}" fill="${C.page}"/>
            <g clip-path="url(#t)" stroke="${C.rule}" stroke-width="1">${RULES.map((y) => `<line x1="0" x2="${L.page.w}" y1="${y}" y2="${y}"/>`).join('')}</g>
          </svg>`} />
        ) : RULES.map((y) => <View key={y} style={{ position: 'absolute', left: 0, right: 0, top: y * u, height: Math.max(1, u), backgroundColor: C.rule }} />)}

        <T style={{ position: 'absolute', top: 22 * u, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.display, fontSize: 20 * u, lineHeight: 24 * u, color: C.soft }}>
          meet my feathered friend
        </T>

        <View style={{ position: 'absolute', left: L.box.l * u, top: L.box.t * u, width: L.box.w * u, height: L.box.h * u, borderRadius: 20 * u, backgroundColor: C.box, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          {entry.photo
            ? <Photo uri={entry.photo} fit="contain" style={{ width: '100%', height: '100%' }} />
            : <BirdThumb size={96 * u} />}
        </View>
        {/* washi tape holding the photo down */}
        <View style={{ position: 'absolute', left: (L.box.l + L.box.w / 2 - 26.5) * u, top: (L.box.t - 5) * u, width: 53 * u, height: 18 * u, backgroundColor: C.tape, transform: [{ rotate: '0.6deg' }] }} />

        <T numberOfLines={1} adjustsFontSizeToFit style={{ position: 'absolute', top: 284 * u, left: 16 * u, right: 16 * u, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 19 * u, lineHeight: 26 * u, color: C.ink }}>
          {entry.species ?? 'Mystery bird'}
        </T>
        {text ? (
          <T numberOfLines={2} style={{ position: 'absolute', top: 323 * u, left: 24 * u, right: 24 * u, textAlign: 'center', fontFamily: fonts.regular, fontSize: 13 * u, lineHeight: 20 * u, color: C.soft }}>
            {text}
          </T>
        ) : null}

        <View style={{ position: 'absolute', top: 372 * u, left: 8 * u, right: 8 * u, flexDirection: 'row', justifyContent: 'center', gap: 8 * u }}>
          <Chip u={u} C={C} label={`${longDate(entry.createdAt)} • ${clock(entry.createdAt)}`} />
          {entry.place ? <Chip u={u} C={C} label={entry.place} /> : null}
        </View>
      </View>

      {/* postmark */}
      <View style={{ position: 'absolute', top: L.foot * u, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 * u }}>
        <SvgXml xml={eyeSvg} width={30 * u} height={25 * u} />
        <T style={{ fontFamily: fonts.semibold, fontSize: 9.5 * u, letterSpacing: 1.2 * u, color: C.foot }}>ỌJỊUGO BIRD POST</T>
        <T style={{ fontFamily: fonts.regular, fontSize: 10.5 * u, color: C.foot }}>ojiugo.club</T>
      </View>
    </View>
  );
}

function Chip({ label, u, C }: { label: string; u: number; C: Palette }) {
  return (
    <View style={{ flexShrink: 1, height: 36 * u, paddingHorizontal: 15 * u, borderRadius: 18 * u, borderWidth: Math.max(1, u), borderStyle: 'dashed', borderColor: C.dash, justifyContent: 'center' }}>
      <T numberOfLines={1} style={{ fontFamily: fonts.regular, fontSize: 12.5 * u, color: C.ink }}>{label}</T>
    </View>
  );
}
