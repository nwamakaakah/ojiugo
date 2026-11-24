import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { T } from './ui';
import { bellSvg, moonSvg, sunSvg } from './icons';

type Kind = 'bell' | 'moon' | 'sun';
type ToastMsg = { text: string; kind?: Kind; tone?: 'primary' | 'warm' | 'on' | 'off' };
const Ctx = createContext<(m: ToastMsg) => void>(() => {});
export const useToast = () => useContext(Ctx);

const icon = (k: Kind, c: string) => ({
  // her exported icons (Icon Set)
  bell: bellSvg.replace(/\{\{C\}\}/g, c),
  moon: moonSvg.replace(/\{\{C\}\}/g, c),
  sun: sunSvg.replace(/\{\{C\}\}/g, c),
}[k]);

/** Small pill that drops in under the header, e.g. "notifications turned on". */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const op = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: ToastMsg) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    timer.current = setTimeout(() => Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMsg(null)), 2200);
  }, [op]);

  const t = msg?.tone;
  const bg = t === 'warm' ? colors.toastWarm : t === 'on' ? colors.toastOn : t === 'off' ? colors.toastOff : colors.actionPrimary;
  const fg = t === 'warm' ? colors.toastWarmLabel : t === 'on' || t === 'off' ? '#FDFAF1' : colors.textOnPrimary;
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg ? (
        <Animated.View pointerEvents="none" style={[styles.wrap, { top: insets.top + 64, opacity: op, transform: [{ translateY: op.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }] }]}>
          <View accessibilityLiveRegion="polite" style={[styles.pill, { backgroundColor: bg, shadowColor: colors.shadow }]}>
            {msg.kind ? <SvgXml xml={icon(msg.kind, fg)} width={msg.kind === 'moon' ? 14.2 : msg.kind === 'sun' ? 16.7 : 13.1} height={16} /> : null}
            <T v="ui" color={fg}>{msg.text}</T>
          </View>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, height: 40, borderRadius: radius.pill, shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
});
