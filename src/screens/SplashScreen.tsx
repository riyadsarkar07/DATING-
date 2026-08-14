import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../components/ui/AppText';
import { LottieView } from '../components/common/LottieView';
import sparkJson from '../assets/lottie/spark.json';
import { colors } from '../constants/theme';
import { useAuthStore } from '../store/auth.store';
import { useAppStore, hydrateOnboarding } from '../store/app.store';

export function SplashScreen() {
  const navigation = useNavigation();
  const status = useAuthStore((s) => s.status);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const hydrationDone = useAppStore((s) => s.hydrationDone);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    hydrateOnboarding();
  }, []);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.5)) });
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withSequence(
      withRepeat(withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [scale, opacity]);

  useEffect(() => {
    if (!hydrationDone || status === 'unknown') return;
    const timer = setTimeout(() => {
      let route: string = 'Auth';
      if (!onboardingDone) route = 'Onboarding';
      else if (status === 'unauthenticated') route = 'Auth';
      else if (status === 'incomplete-profile') route = 'ProfileSetup';
      else if (status === 'authenticated') route = 'Main';
      (navigation as any).reset({ index: 0, routes: [{ name: route }] });
    }, 1600);
    return () => clearTimeout(timer);
  }, [hydrationDone, status, onboardingDone, navigation]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <LinearGradient colors={['#05050A', '#140A24', '#1A0B2E']} style={styles.container}>
      <LottieView source={sparkJson} width={260} height={260} style={styles.spark} />
      <Animated.View style={[styles.logo, logoStyle]}>
        <View style={styles.logoIcon}>
          <Ionicons name="flame" size={54} color="#FF3EA5" />
        </View>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(600).duration(700)} style={styles.brand}>
        <AppText variant="display" centered style={styles.brandText}>
          Spark
          <AppText variant="display" color={colors.blush[500]} style={styles.brandText}>
            X
          </AppText>
        </AppText>
        <AppText variant="label" color={colors.textSecondary} centered style={styles.tagline}>
          Find your spark
        </AppText>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    position: 'absolute',
    opacity: 0.5,
  },
  logo: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  brand: {
    position: 'absolute',
    bottom: 90,
    alignItems: 'center',
  },
  brandText: {
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 8,
    letterSpacing: 3,
  },
});
