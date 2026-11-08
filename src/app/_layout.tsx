// per-weight imports so only these four fonts get bundled
import { Anton_400Regular } from '@expo-google-fonts/anton/400Regular';
import { Archivo_400Regular } from '@expo-google-fonts/archivo/400Regular';
import { Archivo_600SemiBold } from '@expo-google-fonts/archivo/600SemiBold';
import { Archivo_800ExtraBold } from '@expo-google-fonts/archivo/800ExtraBold';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useHydrated } from '@/store/hydration';
import { useProfile } from '@/store/profile';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, primary: colors.accent, text: colors.text, border: colors.border },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Anton_400Regular, Archivo_400Regular, Archivo_600SemiBold, Archivo_800ExtraBold });
  const hydrated = useHydrated();
  const onboarded = useProfile((s) => !!s.profile);
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 20 },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="muscle/[id]" options={{ title: '' }} />
          <Stack.Screen name="exercise/[id]" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="split/[id]" options={{ title: '' }} />
          <Stack.Screen name="plan" options={{ title: 'Your workout' }} />
          <Stack.Screen name="add-exercise" options={{ title: 'Add exercise' }} />
          <Stack.Screen name="workout" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="summary/[id]" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="history/[id]" options={{ title: '' }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
