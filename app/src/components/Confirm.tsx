import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { Button, T } from './ui';
import { Press } from './Press';

type Ask = {
  title: string;
  body?: string;
  /** the button that goes ahead, e.g. "tear it out" */
  confirm: string;
  /** the button that backs out, e.g. "keep it" */
  cancel?: string;
  /** critical = destructive: the page crumples away when confirmed */
  tone?: 'critical' | 'primary';
};
const Ctx = createContext<(a: Ask) => Promise<boolean>>(async () => false);
/** `if (await confirm({ title, body, confirm: 'tear it out', tone: 'critical' })) …` */
export const useConfirm = () => useContext(Ctx);

// a ragged paper edge along the top of the sheet
const torn = (fill: string) => {
  let d = 'M0 14 L0 7';
  for (let x = 0; x <= 400; x += 10) d += ` L${x + 5} ${x % 20 ? 2 + (x % 7) * 0.6 : 8 - (x % 9) * 0.5} L${x + 10} ${6 + (x % 5) * 0.8}`;
  return `<svg viewBox="0 0 400 14" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="${d} L400 14 Z" fill="${fill}"/></svg>`;
};

/** The diary's own confirm sheet — replaces the phone's system pop-up. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [ask, setAsk] = useState<Ask | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const crumple = useSharedValue(0);

  const open = useCallback((a: Ask) => new Promise<boolean>((res) => {
    crumple.value = 0; resolver.current = res; setAsk(a);
    if (Platform.OS !== 'web' && a.tone === 'critical') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }), [crumple]);

  const finish = useCallback((v: boolean) => { setAsk(null); const r = resolver.current; resolver.current = null; r?.(v); }, []);
  const yes = () => {
    if (ask?.tone !== 'critical') return finish(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    // the sheet crumples into a ball and drops away before the page goes
    crumple.value = withTiming(1, { duration: 420, easing: Easing.in(Easing.cubic) }, (done) => { if (done) runOnJS(finish)(true); });
  };

  const paper = useAnimatedStyle(() => ({
    opacity: 1 - crumple.value * 0.9,
    transform: [
      { translateY: crumple.value * 220 },
      { rotate: `${crumple.value * -14}deg` },
      { scaleX: 1 - crumple.value * 0.55 },
      { scaleY: 1 - crumple.value * 0.7 },
    ],
  }));
  const pulse = useSharedValue(1);
  const shake = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const nudge = () => { pulse.value = withSpring(1.03, { damping: 4, stiffness: 400 }, () => { pulse.value = withSpring(1); }); };

  const critical = ask?.tone === 'critical';
  return (
    <Ctx.Provider value={open}>
      {children}
      <Modal visible={!!ask} transparent animationType="none" statusBarTranslucent onRequestClose={() => finish(false)}>
        {ask ? (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlayScrim }]}>
              <Press sink={1} accessibilityLabel={ask.cancel ?? 'keep it'} onPress={nudge} style={{ flex: 1 }} />
            </Animated.View>
            <Animated.View entering={SlideInDown.springify().damping(17).stiffness(170)} exiting={SlideOutDown.duration(220)} style={styles.dock}>
              <Animated.View style={[paper, shake]}>
                <SvgXml xml={torn(colors.surfacePage)} width="100%" height={14} style={{ marginBottom: -1 }} />
                <View accessibilityRole="alert" style={[styles.sheet, { backgroundColor: colors.surfacePage, paddingBottom: insets.bottom + space.lg, shadowColor: colors.shadow }]}>
                  <T v="displayLg" style={{ fontSize: 28, lineHeight: 32 }}>{ask.title}</T>
                  {ask.body ? <T v="bodyMd" color={colors.textSubtle}>{ask.body}</T> : null}
                  <View style={{ gap: space.md, marginTop: space.md }}>
                    <Button title={ask.cancel ?? 'keep it'} arrow={false} onPress={() => finish(false)} />
                    <Press haptic accessibilityRole="button" onPress={yes}
                      style={[styles.go, { borderColor: critical ? colors.textCritical : colors.borderDefault }]}>
                      <T v="button" color={critical ? colors.textCritical : colors.textDefault}>{ask.confirm}</T>
                    </Press>
                  </View>
                </View>
              </Animated.View>
            </Animated.View>
          </View>
        ) : null}
      </Modal>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  sheet: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.sm, shadowOpacity: 1, shadowRadius: 18, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  go: { height: 52, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
