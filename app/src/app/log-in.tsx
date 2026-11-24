import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { BackLink, Button, Divider, Field, Heading, Notice, Screen, SocialRow, T } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

export default function LogIn() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) return setError('pop in your email and password first');
    setBusy(true);
    const res = await signIn(email.trim(), password);
    setBusy(false);
    if (res.error) return setError(res.error);
    router.replace('/');
  };

  return (
    <Screen scroll>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <Heading>your diary’s been waiting</Heading>
      </View>
      <View style={{ gap: space.xl, marginTop: space.xl }}>
        <Field label="your email" value={email} onChangeText={(t) => { setEmail(t); setError(undefined); }} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
        <View style={{ gap: space.md }}>
          <Field label="password" value={password} onChangeText={(t) => { setPassword(t); setError(undefined); }} secure autoComplete="current-password" textContentType="password" />
          <Pressable onPress={() => router.push({ pathname: '/reset-password', params: { email } })} style={{ alignSelf: 'flex-end' }} hitSlop={8}>
            <T v="ui" color={colors.textDefault}>forgot password</T>
          </Pressable>
        </View>
        {error ? <Notice>{error}</Notice> : null}
      </View>
      <View style={{ flex: 1, minHeight: space['3xl'] }} />
      <View style={{ gap: space.lg }}>
        <Button title="open my diary" onPress={submit} loading={busy} />
        <Divider label="or continue with" />
        <SocialRow onPress={() => setNote('google and apple sign-in switch on once your supabase project is connected')} />
        {note ? <Notice>{note}</Notice> : null}
        <Button variant="ghost" title="i don't have a diary - get one" onPress={() => router.replace('/sign-up')} />
      </View>
    </Screen>
  );
}
