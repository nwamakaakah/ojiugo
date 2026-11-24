import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { T } from './ui';

type Kind = 'bell' | 'moon' | 'sun';
type ToastMsg = { text: string; kind?: Kind; tone?: 'primary' | 'warm' | 'on' | 'off' };
const Ctx = createContext<(m: ToastMsg) => void>(() => {});
export const useToast = () => useContext(Ctx);

const icon = (k: Kind, c: string) => ({
  bell: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round"><path d="M4 11.5c.7-.8 1-1.8 1-3V7a3 3 0 0 1 6 0v1.5c0 1.2.3 2.2 1 3H4Z"/><path d="M6.8 13.2c.4.5.8.7 1.2.7s.8-.2 1.2-.7"/></svg>`,
  moon: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round"><path d="M10.8 2.6A5.6 5.6 0 1 0 13.4 11 4.6 4.6 0 0 1 10.8 2.6Z"/></svg>`,
  sun: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/></svg>`,
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
            {msg.kind ? <SvgXml xml={icon(msg.kind, fg)} width={14} height={14} /> : null}
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
