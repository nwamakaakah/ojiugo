import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { BackLink, Button, Divider, Field, Heading, Notice, Screen, SocialRow } from '../components/ui';
import { useAuth } from '../lib/auth';
import { space } from '../theme/tokens';

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export default function SignUp() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const submit = async () => {
    const e: typeof errors = {};
    if (!emailOk(email)) e.email = 'hmm, that email looks a little off — mind checking?';
    if (password.length < 8) e.password = 'a little longer please — at least 8 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const res = await signUp(name.trim(), email.trim(), password);
    setBusy(false);
    if (res.error) return setErrors({ form: res.error });
    router.replace('/country');
  };

  return (
    <Screen scroll>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <Heading>this diary belongs to…</Heading>
      </View>
      <View style={{ gap: space.xl, marginTop: space.xl }}>
        <Field label="your name" placeholder="what should the diary call you?" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
        <Field label="your email" placeholder="so your birds don't get lost" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" error={errors.email} />
        <Field label="password" placeholder="a little lock for your diary" value={password} onChangeText={setPassword} secure autoComplete="new-password" textContentType="newPassword" error={errors.password} />
        {errors.form ? <Notice>{errors.form}</Notice> : null}
      </View>
      <View style={{ flex: 1, minHeight: space['3xl'] }} />
      <View style={{ gap: space.lg }}>
        <Button title="bind my diary" onPress={submit} loading={busy} />
        <Divider label="or bind it with" />
        <SocialRow onPress={() => setNote('google and apple sign-in switch on once your supabase project is connected')} />
        {note ? <Notice>{note}</Notice> : null}
        <Button variant="ghost" title="i already have a diary - open it" onPress={() => router.replace('/log-in')} />
      </View>
    </Screen>
  );
}
