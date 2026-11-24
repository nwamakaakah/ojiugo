import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackLink, Button, Field, Heading, Notice, Screen } from '../components/ui';
import { useAuth } from '../lib/auth';
import { space } from '../theme/tokens';

export default function ResetPassword() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { sendResetCode } = useAuth();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('hmm, that email looks a little off — mind checking?');
    setBusy(true);
    const res = await sendResetCode(email.trim());
    setBusy(false);
    if (res.error) return setError(res.error);
    router.push({ pathname: '/verify-code', params: { email: email.trim() } });
  };

  return (
    <Screen scroll>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <Heading sub="we'll send a code to get you back in">reset your password</Heading>
      </View>
      <View style={{ gap: space.xl, marginTop: space.xl }}>
        <Field label="your email" value={email} onChangeText={(t) => { setEmail(t); setError(undefined); }} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={error} />
      </View>
      <View style={{ flex: 1, minHeight: space['3xl'] }} />
      <View style={{ gap: space.sm }}>
        <Button title="send reset link" onPress={submit} loading={busy} />
        <Button variant="ghost" title="i remember my password" onPress={() => router.replace('/log-in')} />
      </View>
    </Screen>
  );
}
