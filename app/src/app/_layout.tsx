import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Mali_400Regular, Mali_500Medium, Mali_600SemiBold, Mali_700Bold } from '@expo-google-fonts/mali';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { AuthProvider } from '../lib/auth';
import { ToastProvider } from '../components/Toast';
import { ConfirmProvider } from '../components/Confirm';
import { startSync } from '../lib/sync';

SplashScreen.preventAutoHideAsync().catch(() => {});

const TABS = ['entries', 'flocks', 'calls', 'me'];
const SHEETS = ['scribble', 'write', 'name', 'search'];
const MOMENTS = ['auth-callback', 'entry-saved', 'scribble-saved', 'rewritten', 'torn', 'stamp-saved', 'mystery-result', 'milestone', 'location-set', 'password-set', 'loading'];

function Root() {
  const { colors } = useTheme();
  return (
    <>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgApp }, animation: 'ios_from_right', animationDuration: 320 }}>
        {/* the four tabs cross-fade so the nav bar stays put */}
        {TABS.map((n) => <Stack.Screen key={n} name={n} options={{ animation: 'fade', animationDuration: 200 }} />)}
        {/* writing in the diary rises up like opening a notebook */}
        {SHEETS.map((n) => <Stack.Screen key={n} name={n} options={{ animation: 'slide_from_bottom', animationDuration: 380 }} />)}
        {/* little celebrations and confirmations fade up softly */}
        {MOMENTS.map((n) => <Stack.Screen key={n} name={n} options={{ animation: 'fade_from_bottom', animationDuration: 320, gestureEnabled: false }} />)}
      </Stack>
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
          <ToastProvider>
            <ConfirmProvider>
              <Root />
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
