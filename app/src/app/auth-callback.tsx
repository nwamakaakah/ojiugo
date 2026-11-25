import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button, Screen, T } from '../components/ui';
import { Sparkles } from '../components/illustrations';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

// Where the "confirm your email" link lands (via ojiugo.club/auth/callback, which hands the birder back to the app).
// The link carries the new session (as #access_token… or ?code=…). We sign the birder in and carry on.
// It never waits forever: as soon as there's a session — from the link, or already — it moves on, and after a
// few seconds without one it offers a way out instead of spinning.
export default function AuthCallback() {
  const { colors } = useTheme();
  const hookUrl = Linking.useURL();
  const params = useLocalSearchParams<{ code?: string; access_token?: string; refresh_token?: string; error_description?: string }>();
  const [failed, setFailed] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    router.replace('/');   // index sends them to the country picker or their diary
  };

  // 1. any way we end up signed in counts
  useEffect(() => {
    if (!supabase) { setFailed(true); return; }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (session) finish(); });
    supabase.auth.getSession().then(({ data }) => { if (data.session) finish(); });
    const t = setTimeout(() => { if (!done.current) setFailed(true); }, 8000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  // 2. read the link — whichever way it reached us — and sign in with what it carries
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const url = hookUrl ?? (await Linking.getInitialURL()) ?? '';
      const read = (s: string) => new URLSearchParams(s);
      const hash = url.includes('#') ? read(url.split('#')[1]) : read('');
      const query = url.includes('?') ? read(url.split('?')[1].split('#')[0]) : read('');
      const get = (k: 'access_token' | 'refresh_token' | 'code' | 'error_description') =>
        hash.get(k) ?? query.get(k) ?? (params[k] as string | undefined) ?? null;

      if (get('error_description')) { setFailed(true); return; }
      const access_token = get('access_token'), refresh_token = get('refresh_token'), code = get('code');
      try {
        if (access_token && refresh_token) {
          const { error } = await supabase!.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase!.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else return;   // nothing in this link (yet) — the session check / timeout above decides
        if (!cancelled) finish();
      } catch {
        // the link may already have been used; if we're signed in anyway, step 1 moves us on
        const { data } = await supabase!.auth.getSession();
        if (data.session) finish(); else if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [hookUrl, params.code, params.access_token]);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
        <Sparkles width={190} />
        <T v="displayLg" style={{ textAlign: 'center', fontSize: 26, lineHeight: 32 }}>{failed ? 'that link has flown off' : 'opening your diary…'}</T>
        {failed ? <T v="bodySm" color={colors.textSubtle} style={{ textAlign: 'center' }}>your email may already be confirmed — open your diary with your email and password</T> : null}
      </View>
      {failed ? <Button title="open my diary" arrow={false} onPress={() => router.replace('/log-in')} /> : null}
    </Screen>
  );
}
