import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';
import { T } from './ui';
import { Press } from './Press';
import { Scrim } from './Scrim';

type Ask = {
  title: string;
  body?: string;
  /** the button that goes ahead, e.g. "yes, tear it out" */
  confirm: string;
  /** the button that backs out, e.g. "keep it" */
  cancel?: string;
  /** critical = destructive: the go-ahead button is filled in the critical colour */
  tone?: 'critical' | 'primary';
};
const Ctx = createContext<(a: Ask) => Promise<boolean>>(async () => false);
/** `if (await confirm({ title, body, confirm: 'yes, tear it out', tone: 'critical' })) …` */
export const useConfirm = () => useContext(Ctx);

const settle = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.96 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.out(Easing.cubic) },
}).duration(220);
const leave = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 0.98 }] },
}).duration(160);

/** The diary's own confirm dialog (Figma: "tear this page out?") — a centred card over a blurred page. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [ask, setAsk] = useState<Ask | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const open = useCallback((a: Ask) => new Promise<boolean>((res) => { resolver.current = res; setAsk(a); }), []);

  // close first, then answer once the dialog has gone — navigating while a modal is still closing gets ignored on iPhone
  const finish = useCallback((v: boolean) => {
    setAsk(null);
    const r = resolver.current; resolver.current = null;
    setTimeout(() => r?.(v), Platform.OS === 'ios' ? 350 : 60);
  }, []);
  const yes = () => {
    if (ask?.tone !== 'primary' && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    finish(true);
  };

  const critical = ask?.tone !== 'primary';
  return (
    <Ctx.Provider value={open}>
      {children}
      <Modal visible={!!ask} transparent animationType="none" statusBarTranslucent onRequestClose={() => finish(false)}>
        {ask ? (
          <View style={styles.center}>
            <Scrim />
            <Pressable accessibilityLabel={ask.cancel ?? 'keep it'} onPress={() => finish(false)} style={StyleSheet.absoluteFill} />
            <Animated.View entering={settle} exiting={leave} accessibilityRole="alert"
              style={[styles.card, { width: Math.min(width - 48, 380), backgroundColor: colors.surfacePage, shadowColor: colors.shadow }]}>
              <View style={[styles.head, { borderColor: colors.borderSubtle }]}>
                <T v="displayLg" style={{ fontSize: 24, lineHeight: 30 }}>{ask.title}</T>
              </View>
              {ask.body ? (
                <View style={[styles.body, { borderColor: colors.borderSubtle }]}>
                  <T v="bodyMd" color={colors.textSubtle}>{ask.body}</T>
                </View>
              ) : null}
              <View style={styles.actions}>
                <Press haptic accessibilityRole="button" onPress={yes}
                  style={[styles.btn, { backgroundColor: critical ? colors.actionCritical : colors.actionPrimary }]}>
                  <T v="button" color={colors.textOnPrimary}>{ask.confirm}</T>
                </Press>
                <Press accessibilityRole="button" onPress={() => finish(false)}
                  style={[styles.btn, { borderWidth: 1, borderColor: colors.borderDefault, backgroundColor: colors.surfacePage }]}>
                  <T v="button">{ask.cancel ?? 'keep it'}</T>
                </Press>
              </View>
            </Animated.View>
          </View>
        ) : null}
      </Modal>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 24, overflow: 'hidden', shadowOpacity: 1, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  head: { paddingHorizontal: space.lg, paddingTop: space.lg + 4, paddingBottom: space.md, borderBottomWidth: 1 },
  body: { paddingHorizontal: space.lg, paddingVertical: space.lg, borderBottomWidth: 1 },
  actions: { flexDirection: 'row', gap: space.md, padding: space.lg },
  btn: { flex: 1, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.sm },
});
