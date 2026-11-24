import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { T } from './ui';

const TABS = [
  { key: 'entries', label: 'entries', href: '/entries' },
  { key: 'flocks', label: 'flocks', href: '/entries' },
  { key: 'add', label: '', href: '/entries' },
  { key: 'calls', label: 'calls', href: '/entries' },
  { key: 'me', label: 'me', href: '/me' },
] as const;

export function TabBar({ active }: { active: 'entries' | 'me' }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const plus = `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" stroke="${colors.textOnPrimary}" stroke-width="2" stroke-linecap="round"><path d="M9 2v14M2 9h14"/></svg>`;
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.md), backgroundColor: colors.navGlassFill, borderTopColor: colors.borderLight }]}>
      {TABS.map((t) =>
        t.key === 'add' ? (
          <Pressable key={t.key} accessibilityRole="button" accessibilityLabel="add an entry" style={[styles.add, { backgroundColor: colors.actionPrimary }]} onPress={() => router.push('/entries')}>
            <SvgXml xml={plus} width={18} height={18} />
          </Pressable>
        ) : (
          <Pressable key={t.key} accessibilityRole="tab" accessibilityState={{ selected: active === t.key }} style={styles.tab} onPress={() => router.replace(t.href)}>
            <T v="ui" color={active === t.key ? colors.textDefault : colors.textLight}>{t.label}</T>
            <View style={[styles.mark, { backgroundColor: active === t.key ? colors.textDefault : 'transparent' }]} />
          </Pressable>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
  tab: { alignItems: 'center', gap: 4, minWidth: 56, paddingVertical: space.xs },
  mark: { width: 24, height: 3, borderRadius: radius.pill },
  add: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: -space.lg },
});
