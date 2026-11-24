import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { BackLink, Button, Heading, Notice, Screen, T } from '../components/ui';
import { CodeInput } from '../components/CodeInput';
import { DEMO_RESET_CODE, useAuth } from '../lib/auth';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

export default function VerifyCode() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const { verifyResetCode, sendResetCode, isDemo } = useAuth();
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(20);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const paste = async () => {
    try { const t = await Clipboard.getStringAsync(); setCode(t.replace(/\D/g, '').slice(0, 6)); } catch {}
  };
  const resend = async () => { setSecs(20); setError(undefined); await sendResetCode(email); };
  const submit = async () => {
    setBusy(true);
    const res = await verifyResetCode(email, code);
    setBusy(false);
    if (res.error) return setError(res.error);
    router.replace('/new-password');
  };

  return (
    <Screen scroll>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <Heading sub="we sent a little code to your inbox">verify your email</Heading>
      </View>
      <View style={{ gap: space.lg, marginTop: space.xl }}>
        <T v="label" color={colors.textLight}>ENTER CODE</T>
        <CodeInput value={code} onChange={(v) => { setCode(v); setError(undefined); }} />
        <Pressable onPress={paste} style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs }}>
          <T v="ui">paste code</T>
        </Pressable>
        {secs > 0
          ? <T v="bodySm" color={colors.textSubtle}>code will be resent in {secs} secs</T>
          : <Pressable onPress={resend}><T v="bodySm" color={colors.textSubtle}>didn’t get the code? <T v="bodySm" color={colors.textInteractive} style={{ textDecorationLine: 'underline' }}>send again</T></T></Pressable>}
        {error ? <Notice>{error}</Notice> : null}
        {isDemo ? <Notice>demo mode: use the code {DEMO_RESET_CODE}</Notice> : null}
      </View>
      <View style={{ flex: 1, minHeight: space['3xl'] }} />
      <Button title="verify & continue" onPress={submit} disabled={code.length < 6} loading={busy} />
    </Screen>
  );
}
