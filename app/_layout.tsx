import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeDatabase } from '@/lib/db';
import { AuthProvider } from '@/lib/auth-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { UiOverrideProvider } from '@/components/Themed';
import { getUiOverrides } from '@/lib/repos';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      initializeDatabase().finally(() => SplashScreen.hideAsync());
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <AppProviders><RootLayoutNav /></AppProviders>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const overrides = useQuery({ queryKey: ['ui_overrides'], queryFn: getUiOverrides });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UiOverrideProvider value={overrides.data || null}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="echo-tab" options={{ title: 'Echo Tab' }} />
        </Stack>
      </UiOverrideProvider>
    </ThemeProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'agriden-cache',
});

function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Persist query client on mount
    persistQueryClient({
      queryClient,
      persister: asyncStoragePersister,
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
