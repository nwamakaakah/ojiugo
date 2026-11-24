import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { T } from './ui';
import { BirdThumb } from './BirdThumb';
import { longDate, clock, type Entry } from '../lib/entries';
import { fonts } from '../theme/tokens';
import { eyeSvg } from './svgs';

// "Shared Page" (Figma 2012:11387), measured in design points on a 393 × 574 frame and scaled to fit.
// It's an image people share, so it keeps the daylight palette whatever theme the app is in.
const W = 393, H = 574;
const C = {
  frame: '#F6F2E7', page: '#FDFAF2', rule: '#EEE9DD', box: '#E9E3D7', tape: 'rgba(140,136,126,0.55)',
  ink: '#2C261F', soft: '#4A4239', dash: '#CFC8BA', foot: '#6E655B',
};
const foliage = require('../../assets/images/share-foliage.png');
const RULES = [40, 86, 132, 178, 224, 270, 316, 361, 407]; // ruled lines, from the top of the page

/** The shareable "meet my feathered friend" card. Give it the width it should fill. */
export function BirdieCard({ entry, blurb, width }: { entry: Entry; blurb?: string; width?: number }) {
  const [measured, setMeasured] = useState(W);
  const w = width ?? measured;
  const u = w / W;
  const text = blurb ?? entry.describe;
  return (
    <View onLayout={width ? undefined : (e) => setMeasured(e.nativeEvent.layout.width)}
      style={{ width: width ?? '100%', height: H * u, backgroundColor: C.frame, overflow: 'hidden' }}>
      <Image source={foliage} style={StyleSheet.absoluteFill} resizeMode="stretch" />

      {/* the page */}
      <View style={{ position: 'absolute', left: 16 * u, top: 58 * u, width: 360 * u, height: 454 * u, backgroundColor: C.page,
        shadowColor: '#5A4A32', shadowOpacity: 0.12, shadowRadius: 6 * u, shadowOffset: { width: 0, height: 2 * u }, elevation: 3 }}>
        {RULES.map((y) => <View key={y} style={{ position: 'absolute', left: 0, right: 0, top: y * u, height: Math.max(1, u), backgroundColor: C.rule }} />)}

        <T style={{ position: 'absolute', top: 22 * u, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.display, fontSize: 20 * u, lineHeight: 24 * u, color: C.soft }}>
          meet my feathered friend
        </T>

        <View style={{ position: 'absolute', left: 16 * u, top: 64 * u, width: 328 * u, height: 204 * u, borderRadius: 20 * u, backgroundColor: C.box, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          {entry.photo
            ? <Image source={{ uri: entry.photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            : <BirdThumb size={96 * u} />}
        </View>
        {/* washi tape holding the photo down */}
        <View style={{ position: 'absolute', left: 154 * u, top: 59 * u, width: 53 * u, height: 18 * u, backgroundColor: C.tape, transform: [{ rotate: '0.6deg' }] }} />

        <T numberOfLines={1} adjustsFontSizeToFit style={{ position: 'absolute', top: 284 * u, left: 16 * u, right: 16 * u, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 19 * u, lineHeight: 26 * u, color: C.ink }}>
          {entry.species ?? 'Mystery bird'}
        </T>
        {text ? (
          <T numberOfLines={2} style={{ position: 'absolute', top: 323 * u, left: 24 * u, right: 24 * u, textAlign: 'center', fontFamily: fonts.regular, fontSize: 13 * u, lineHeight: 20 * u, color: C.soft }}>
            {text}
          </T>
        ) : null}

        <View style={{ position: 'absolute', top: 372 * u, left: 8 * u, right: 8 * u, flexDirection: 'row', justifyContent: 'center', gap: 8 * u }}>
          <Chip u={u} label={`${longDate(entry.createdAt)} • ${clock(entry.createdAt)}`} />
          {entry.place ? <Chip u={u} label={entry.place} /> : null}
        </View>
      </View>

      {/* postmark */}
      <View style={{ position: 'absolute', top: 525 * u, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 * u }}>
        <SvgXml xml={eyeSvg} width={30 * u} height={25 * u} />
        <T style={{ fontFamily: fonts.semibold, fontSize: 9.5 * u, letterSpacing: 1.2 * u, color: C.foot }}>ỌJỊUGO BIRD POST</T>
        <T style={{ fontFamily: fonts.regular, fontSize: 10.5 * u, color: C.foot }}>ojiugo.club</T>
      </View>
    </View>
  );
}

function Chip({ label, u }: { label: string; u: number }) {
  return (
    <View style={{ flexShrink: 1, height: 36 * u, paddingHorizontal: 15 * u, borderRadius: 18 * u, borderWidth: Math.max(1, u), borderStyle: 'dashed', borderColor: C.dash, justifyContent: 'center' }}>
      <T numberOfLines={1} style={{ fontFamily: fonts.regular, fontSize: 12.5 * u, color: C.ink }}>{label}</T>
    </View>
  );
}
