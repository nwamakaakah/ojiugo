import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button, Screen, T } from '../components/ui';
import { Sparkles } from '../components/illustrations';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

// Where the "confirm your email" link lands (via ojiugo.club/auth/callback, which hands the birder back to the app).
// The link carries the new session; we sign the birder in and carry on to the country picker / their diary.
export default function AuthCallback() {
  const { colors } = useTheme();
  const url = Linking.useURL();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url || !supabase) return;
    const frag = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
    const p = new URLSearchParams(frag);
    const access_token = p.get('access_token'), refresh_token = p.get('refresh_token'), code = p.get('code');
    const go = async () => {
      if (access_token && refresh_token) {
        const { error } = await supabase!.auth.setSession({ access_token, refresh_token });
        if (error) return setFailed(true);
      } else if (code) {
        const { error } = await supabase!.auth.exchangeCodeForSession(code);
        if (error) return setFailed(true);
      } else return setFailed(true);
      router.replace('/');   // index sends them to the country picker or their diary
    };
    go();
  }, [url]);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <Sparkles width={190} />
        <T v="displayLg" style={{ textAlign: 'center', fontSize: 26, lineHeight: 32 }}>{failed ? 'that link has flown off' : 'opening your diary…'}</T>
        {failed ? <T v="bodySm" color={colors.textSubtle} style={{ textAlign: 'center' }}>it may have expired — open your diary with your email and password instead</T> : null}
      </View>
      {failed ? <Button title="open my diary" arrow={false} onPress={() => router.replace('/log-in')} /> : null}
    </Screen>
  );
}
