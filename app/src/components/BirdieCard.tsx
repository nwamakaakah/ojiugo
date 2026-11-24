import { Image, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { T } from './ui';
import { BirdThumb } from './BirdThumb';
import { Stamp } from './form';
import { longDate, clock, type Entry } from '../lib/entries';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';
import { eyeSvg } from './svgs';

/** The shareable "meet my feathered friend" card (Figma: Share Page / Share Preview). */
export function BirdieCard({ entry, blurb }: { entry: Entry; blurb?: string }) {
  const { colors } = useTheme();
  const lines = { backgroundColor: colors.surfacePage };
  return (
    <View style={[{ padding: space.lg, gap: space.md, borderRadius: radius.sm }, lines]}>
      <T v="handNote" style={{ fontFamily: type.displayLg.fontFamily, textAlign: 'center', fontSize: 20 }}>meet my feathered friend</T>
      <View style={{ alignItems: 'center' }}>
        <View style={{ position: 'absolute', top: -8, zIndex: 1, width: 64, height: 22, backgroundColor: colors.softNeutralFill, opacity: 0.9 }} />
        {entry.photo ? <Image source={{ uri: entry.photo }} style={{ width: '100%', height: 200, borderRadius: radius.xl }} /> : <View style={{ width: '100%', height: 200, borderRadius: radius.xl, backgroundColor: colors.softNeutralFill, alignItems: 'center', justifyContent: 'center' }}><BirdThumb size={80} /></View>}
      </View>
      <T v="title" style={{ textAlign: 'center', fontSize: 22 }}>{entry.species ?? 'Mystery bird'}</T>
      {blurb || entry.describe ? <T v="bodyMd" color={colors.textSubtle} style={{ textAlign: 'center' }}>{blurb ?? entry.describe}</T> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm }}>
        <Stamp label={`${longDate(entry.createdAt)} • ${clock(entry.createdAt)}`} />
        {entry.place ? <Stamp label={entry.place} /> : null}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm, marginTop: space.sm }}>
        <SvgXml xml={eyeSvg} width={26} height={22} />
        <T v="overline" color={colors.textSubtle}>ọjịugo bird post</T>
        <T v="caption" color={colors.textSubtle}>ojiugo.club</T>
      </View>
    </View>
  );
}
