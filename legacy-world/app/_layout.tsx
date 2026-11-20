import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme';
import { AuthProvider } from '../src/lib/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="podcast" options={{ title: 'Podcast', headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="login" options={{ title: 'Cuenta', presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
