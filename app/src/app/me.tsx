import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, T } from '../components/ui';
import { TabBar } from '../components/TabBar';
import { useAuth } from '../lib/auth';
import { useTheme } from '../theme/ThemeProvider';
import { SEASONS, radius, space } from '../theme/tokens';

// Temporary "me" screen: season + daylight/lamplight switches until the Profile & Theme flows are built.
export default function Me() {
  const { colors, season, setSeason, appearance, setAppearance } = useTheme();
  const { user, signOut, isDemo } = useAuth();
  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Pressable key={label} onPress={onPress} accessibilityState={{ selected: on }}
      style={{ paddingHorizontal: space.lg, height: 40, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: on ? colors.actionPrimary : colors.borderDefault, backgroundColor: on ? colors.softInteractiveFill : 'transparent' }}>
      <T v="ui" color={on ? colors.softInteractiveLabel : colors.textSubtle}>{label}</T>
    </Pressable>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space['2xl'] }}>
        <View style={{ gap: space.xs }}>
          <T v="displayLg">{user?.name ? `hello, ${user.name}` : 'your diary'}</T>
          <T v="bodyMd" color={colors.textSubtle}>{user?.email}{user?.country ? ` · ${user.country}` : ''}</T>
          {isDemo ? <T v="caption" color={colors.textLight}>demo mode — saved on this device only</T> : null}
        </View>
        <View style={{ gap: space.md }}>
          <T v="overline" color={colors.textLight}>season</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {SEASONS.map((s) => chip(s.label, season === s.id, () => setSeason(s.id)))}
          </View>
        </View>
        <View style={{ gap: space.md }}>
          <T v="overline" color={colors.textLight}>light</T>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {chip('daylight', appearance === 'daylight', () => setAppearance('daylight'))}
            {chip('lamplight', appearance === 'lamplight', () => setAppearance('lamplight'))}
          </View>
        </View>
        <Button title="close my diary" arrow={false} onPress={async () => { await signOut(); router.replace('/welcome'); }} />
      </ScrollView>
      <TabBar active="me" />
    </SafeAreaView>
  );
}
