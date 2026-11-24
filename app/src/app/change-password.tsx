import { useState } from 'react';
import { View } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { router } from 'expo-router';
import { BackLink, Button, Field, Screen, T } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

// Settings / Change Password (Figma 2012:10822 / 10876)
export default function ChangePassword() {
  const { colors } = useTheme();
  const { changePassword, sendResetCode, user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const short = next.length > 0 && next.length < 8;
  const ready = current.length > 0 && next.length >= 8 && !error;

  const save = async () => {
    setBusy(true);
    const r = await changePassword(current, next);
    setBusy(false);
    if (r.error) return setError(r.error);
    router.replace('/password-set');
  };
  const forgot = async () => {
    if (user?.email) await sendResetCode(user.email);
    router.push({ pathname: '/verify-code', params: { email: user?.email ?? '' } });
  };

  return (
    <Screen scroll>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <T v="displayLg" style={{ fontSize: 26, lineHeight: 30 }}>change your password</T>
      </View>
      <View style={{ gap: space.xl, marginTop: space.lg }}>
        <Field label="current password" value={current} onChangeText={(t) => { setCurrent(t); setError(undefined); }} secure autoComplete="current-password" textContentType="password" error={error} />
        <Field label="new password" value={next} onChangeText={setNext} secure autoComplete="new-password" textContentType="newPassword" hint={short ? 'a little longer please — at least 8 characters' : undefined} />
      </View>
      <View style={{ flex: 1, minHeight: space['3xl'] }} />
      <View style={{ gap: space.md }}>
        <Button title="save new password" arrow={!!error || !ready} onPress={save} disabled={!ready} loading={busy} />
        <Pressable onPress={forgot} style={{ alignSelf: 'center', padding: space.xs }}><T v="ui" color={colors.textSubtle}>forgot password</T></Pressable>
      </View>
    </Screen>
  );
}
