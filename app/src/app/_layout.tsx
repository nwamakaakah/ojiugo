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

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { colors } = useTheme();
  return (
    <>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgApp }, animation: 'slide_from_right' }} />
    </>
  );
}

export default function Layout() {
  const [loaded] = useFonts({ Mali_400Regular, Mali_500Medium, Mali_600SemiBold, Mali_700Bold, Caveat_700Bold });
  useEffect(() => { if (loaded) SplashScreen.hideAsync().catch(() => {}); }, [loaded]);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Root />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
