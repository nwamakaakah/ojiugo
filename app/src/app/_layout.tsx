import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Mali_400Regular, Mali_500Medium, Mali_600SemiBold, Mali_700Bold } from '@expo-google-fonts/mali';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { AuthProvider } from '../lib/auth';
import { ToastProvider } from '../components/Toast';
import { ConfirmProvider } from '../components/Confirm';
import { BlurTarget, BlurTargetProvider } from '../components/BlurTarget';
import { startSync } from '../lib/sync';
import { SoundCues } from '../lib/feedback';

SplashScreen.preventAutoHideAsync().catch(() => {});

const TABS = ['entries', 'flocks', 'calls', 'me'];
const SHEETS = ['scribble', 'write', 'name', 'search'];
const MOMENTS = ['auth-callback', 'entry-saved', 'scribble-saved', 'rewritten', 'torn', 'stamp-saved', 'mystery-result', 'milestone', 'location-set', 'password-set', 'loading'];

function Root() {
  const { colors } = useTheme();
  return (
    <>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <BlurTarget>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgApp }, animation: 'ios_from_right', animationDuration: 320 }}>
        {/* the four tabs switch in place so the nav bar never moves or flickers; their content rises in on its own */}
        {TABS.map((n) => <Stack.Screen key={n} name={n} options={{ animation: 'none' }} />)}
        {/* writing in the diary rises up like opening a notebook */}
        {SHEETS.map((n) => <Stack.Screen key={n} name={n} options={{ animation: 'slide_from_bottom', animationDuration: 380 }} />)}
        {/* little celebrations and confirmations fade up softly */}
        {MOMENTS.map((n) => <Stack.Screen key={n} name={n} options={{ animation: 'fade_from_bottom', animationDuration: 320, gestureEnabled: false }} />)}
      </Stack>
      </BlurTarget>
    </>
  );
}

export default function Layout() {
  const [loaded] = useFonts({ Mali_400Regular, Mali_500Medium, Mali_600SemiBold, Mali_700Bold, Caveat_700Bold });
  useEffect(() => { if (loaded) SplashScreen.hideAsync().catch(() => {}); }, [loaded]);
  useEffect(() => { startSync(); }, []);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <BlurTargetProvider>
          <SoundCues />
          <ToastProvider>
            <ConfirmProvider>
              <Root />
            </ConfirmProvider>
          </ToastProvider>
          </BlurTargetProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * If any screen throws, show this instead of closing the app — with the error, so it can be reported,
 * and a way back to the diary.
 */
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16, backgroundColor: '#F6F2E7' }}>
      <Text style={{ fontSize: 24, fontWeight: '600', color: '#221D17' }}>a feather got stuck</Text>
      <Text style={{ fontSize: 15, color: '#5E564A' }}>something went wrong on this page. a screenshot of the note below helps fix it.</Text>
      <Text selectable style={{ fontSize: 12, color: '#7A6F60', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{String(error?.message ?? error).slice(0, 600)}</Text>
      <Pressable onPress={() => { retry(); }} style={{ height: 48, borderRadius: 999, backgroundColor: '#5B624A', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FDFAF1', fontSize: 16 }}>try again</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/')} style={{ height: 48, borderRadius: 999, borderWidth: 1, borderColor: '#B8AE9C', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#221D17', fontSize: 16 }}>back to my diary</Text>
      </Pressable>
    </View>
  );
}
