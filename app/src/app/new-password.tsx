import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { BackLink, Button, Field, Heading, Notice, Screen } from '../components/ui';
import { useAuth } from '../lib/auth';
import { space } from '../theme/tokens';

export default function NewPassword() {
  const { updatePassword } = useAuth();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const mismatch = confirm.length > 0 && confirm !== pw;
  const tooShort = pw.length > 0 && pw.length < 8;
  const ready = pw.length >= 8 && pw === confirm;

  const submit = async () => {
    setBusy(true);
    const res = await updatePassword(pw);
    setBusy(false);
    if (res.error) return setError(res.error);
    router.replace('/password-set');
  };

  return (
    <Screen scroll>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <Heading>set a new password</Heading>
      </View>
      <View style={{ gap: space.xl, marginTop: space.xl }}>
        <Field label="new password" value={pw} onChangeText={setPw} secure autoComplete="new-password" textContentType="newPassword" hint={tooShort ? 'a little longer please — at least 8 characters' : undefined} />
        <Field label="confirm password" value={confirm} onChangeText={setConfirm} secure autoComplete="new-password" error={mismatch ? 'those two don’t match just yet' : undefined} />
        {error ? <Notice>{error}</Notice> : null}
      </View>
      <View style={{ flex: 1, minHeight: space['3xl'] }} />
      <Button title="save new password" onPress={submit} disabled={!ready} loading={busy} />
    </Screen>
  );
}
