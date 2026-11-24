import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Image as RNImage, Pressable, View, type GestureResponderEvent } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { T } from './ui';
import { Photo, type Focus } from './Photo';
import { Press } from './Press';
import { tick } from '../lib/feedback';

const BOX_H = 260;

/**
 * The whole photo (nothing cut off) — tap the bird and every crop of this photo (diary card, share card,
 * thumbnails) keeps that spot in frame. A small preview shows how the diary card will look.
 */
export function FramePhoto({ uri, size, focus, onFocus, onChange }: {
  uri: string; size?: { width: number; height: number };
  focus?: Focus; onFocus: (f: Focus) => void; onChange: () => void;
}) {
  const { colors } = useTheme();
  const [box, setBox] = useState(0);
  const boxRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const [dims, setDims] = useState(size ?? null);
  useEffect(() => {
    if (size) { setDims(size); return; }
    RNImage.getSize(uri, (width, height) => setDims({ width, height }), () => setDims(null));
  }, [uri, size]);

  // where the picture actually sits inside the box (it's letterboxed to show all of it)
  const fit = (() => {
    if (!box || !dims) return null;
    const s = Math.min(box / dims.width, BOX_H / dims.height);
    const w = dims.width * s, h = dims.height * s;
    return { w, h, x: (box - w) / 2, y: (BOX_H - h) / 2 };
  })();

  const tap = (e: GestureResponderEvent) => {
    if (!fit) return;
    let { locationX, locationY } = e.nativeEvent;
    if (!Number.isFinite(locationX) || !Number.isFinite(locationY)) {     // some platforms only give page coordinates
      locationX = e.nativeEvent.pageX - origin.current.x; locationY = e.nativeEvent.pageY - origin.current.y;
    }
    const x = Math.min(1, Math.max(0, (locationX - fit.x) / fit.w));
    const y = Math.min(1, Math.max(0, (locationY - fit.y) / fit.h));
    tick(); onFocus({ x, y });
  };
  const f = focus ?? { x: 0.5, y: 0.5 };

  return (
    <View style={{ gap: space.md }}>
      <Pressable accessibilityRole="button" accessibilityLabel="tap where the bird is" onPress={tap}
        ref={boxRef}
        onLayout={(e) => { setBox(e.nativeEvent.layout.width); boxRef.current?.measureInWindow((x, y) => { origin.current = { x, y }; }); }}
        onPressIn={() => boxRef.current?.measureInWindow((x, y) => { origin.current = { x, y }; })}
        style={{ height: BOX_H, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.softNeutralFill }}>
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="contain" pointerEvents="none" />
        {fit ? (
          <View pointerEvents="none" style={{
            position: 'absolute', left: fit.x + f.x * fit.w - 22, top: fit.y + f.y * fit.h - 22, width: 44, height: 44, borderRadius: 22,
            borderWidth: 2.5, borderColor: '#FDFAF1', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 3,
          }} />
        ) : null}
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Photo uri={uri} focus={f} style={{ width: 80, height: 64, borderRadius: radius.sm }} />
        <View style={{ flex: 1, gap: 2 }}>
          <T v="label">tap your bird to keep it in frame</T>
          <T v="caption" color={colors.textSubtle}>that’s how it sits on your diary card</T>
        </View>
      </View>
      <Press accessibilityRole="button" onPress={onChange} style={{ alignSelf: 'flex-start', paddingVertical: space.xs }}>
        <T v="label" color={colors.textInteractive}>change photo</T>
      </Press>
    </View>
  );
}
