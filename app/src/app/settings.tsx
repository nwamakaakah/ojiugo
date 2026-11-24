import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BackLink, T } from '../components/ui';
import { Group, Row, ToggleRow } from '../components/settings';
import { useToast } from '../components/Toast';
import { useAuth } from '../lib/auth';
import { countryByName, SEASON_NAME } from '../lib/countries';
import { storage } from '../lib/storage';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

export const PRIVACY_URL = 'https://ojiugo.club/privacy';

// Settings / Account — "nestkeeping" (Figma 2012:10112)
export default function Settings() {
  const { colors, lightMode } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const toast = useToast();
  const [notify, setNotify] = useState(true);
  useEffect(() => { storage.get('ojiugo.notifications', true).then(setNotify); }, []);

  const c = countryByName(user?.country);
  const seasons = c ? (c.seasons.includes('wet') ? 'rainy, dry' : c.seasons.map((s) => SEASON_NAME[s]).join(', ')) : '';
  const look = lightMode === 'auto' ? 'by the clock' : lightMode;

  const toggleNotify = (v: boolean) => {
    setNotify(v); storage.set('ojiugo.notifications', v);
    toast({ text: v ? 'notifications turned on' : 'notifications turned off', kind: 'bell' });
  };
  const confirmDelete = () => {
    const go = async () => { const r = await deleteAccount(); if (!r.error) router.replace('/welcome'); else toast({ text: r.error }); };
    const msg = 'this tears out every page for good — your entries can’t be brought back.';
    if (Platform.OS === 'web') { if (globalThis.confirm?.(`delete your diary?\n\n${msg}`)) go(); return; }
    Alert.alert('delete your diary?', msg, [{ text: 'keep it', style: 'cancel' }, { text: 'delete', style: 'destructive', onPress: go }]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl }}>
        <View style={{ gap: space.sm }}>
          <BackLink />
          <T v="displayLg" style={{ fontSize: 26, lineHeight: 30 }}>nestkeeping</T>
        </View>

        <Group title="account">
          <Row label="name" value={user?.name?.toLowerCase() || '—'} />
          <Row label="country • seasons" value={c ? `${c.name.toLowerCase()} • ${seasons}` : 'choose where you bird'} onPress={() => router.push({ pathname: '/country', params: { mode: 'settings' } })} />
          <Row label="email address" value={user?.email} />
          <Row label="password" value="••••••••" onPress={() => router.push('/change-password')} />
        </Group>

        <Group title="preferences">
          <ToggleRow title="notifications" value={notify} onChange={toggleNotify} />
          <Row label="theme" value={look} onPress={() => router.push('/settings-theme')} />
        </Group>

        <Group title="about">
          <Row title="data & credits" sub="xeno-canto • inat • ebird" />
          <Row title="privacy" onPress={() => Linking.openURL(PRIVACY_URL)} />
        </Group>

        <View style={{ gap: space.lg, marginTop: space.lg }}>
          <Pressable accessibilityRole="button" onPress={async () => { await signOut(); router.replace('/welcome'); }}
            style={({ pressed }) => ({ height: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderDefault, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <T v="ui">sign out</T>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={confirmDelete} style={{ alignSelf: 'center', padding: space.sm }}>
            <T v="ui" color={colors.textCritical}>delete account</T>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
