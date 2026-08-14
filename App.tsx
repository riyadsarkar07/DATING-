import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import './src/firebase';
import { navigationTheme } from './src/navigation/theme';
import { navigationRef } from './src/navigation/RootNavigationRef';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthRedirect } from './src/navigation/AuthRedirect';
import { useAuthStore } from './src/store/auth.store';
import { useBootstrapWatchers } from './src/hooks/useBootstrapWatchers';
import { bootstrapMessaging } from './src/firebase/messaging';
import { bootstrapAnalytics } from './src/firebase/analytics';
import { bootstrapCrashlytics } from './src/firebase/crashlytics';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const bootstrap = useAuthStore((s) => s.bootstrap);

  useBootstrapWatchers();

  useEffect(() => {
    bootstrapCrashlytics();
    bootstrapAnalytics();
    bootstrapMessaging();
    bootstrap();
  }, [bootstrap]);

  const onReady = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={navigationTheme} onReady={onReady}>
          <StatusBar style="light" />
          <RootNavigator />
          <AuthRedirect />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
