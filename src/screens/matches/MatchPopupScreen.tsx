import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppText } from '../../components/ui/AppText';
import { GradientButton } from '../../components/ui/GradientButton';
import { Confetti } from '../../components/common/Confetti';
import { LottieView } from '../../components/common/LottieView';
import matchJson from '../../assets/lottie/match.json';
import { RootStackParamList } from '../../navigation/types';
import { colors, radius, shadows } from '../../constants/theme';
import { successNotification } from '../../core/utils/haptics';

type Route = RouteProp<RootStackParamList, 'MatchPopup'>;

export function MatchPopupScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const [confetti, setConfetti] = useState(false);
  const { candidateName, candidatePhotos } = route.params;

  useEffect(() => {
    const t = setTimeout(() => {
      setConfetti(true);
      successNotification();
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={['#1A0B2E', '#05050A', '#2E0A3A']} style={styles.bg}>
      <Confetti active={confetti} />
      <View style={styles.content}>
        <LottieView source={matchJson} width={200} height={200} speed={0.9} />
        <AppText variant="title" centered style={styles.title}>
          It&apos;s a Match!
        </AppText>
        <AppText variant="body" color={colors.textSecondary} centered style={styles.subtitle}>
          You and {candidateName} liked each other. Send a message to break the ice.
        </AppText>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.photos}>
          {candidatePhotos?.slice(0, 1).map((url) => (
            <FastImage
              key={url}
              source={{ uri: url }}
              style={styles.photo}
              resizeMode={FastImage.resizeMode.cover}
            />
          ))}
        </Animated.View>

        <View style={styles.actions}>
          <GradientButton
            title="Send a Message"
            onPress={() => {
              (navigation as any).replace('ChatRoom', { matchId: route.params.matchId });
            }}
          />
          <GradientButton
            title="Keep Swiping"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 14 }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    marginTop: -20,
    marginBottom: 10,
  },
  subtitle: {
    maxWidth: 300,
    marginBottom: 24,
  },
  photos: {
    marginBottom: 32,
    ...shadows.glowBlush,
  },
  photo: {
    width: 140,
    height: 180,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.blush[500],
  },
  actions: {
    width: '100%',
    maxWidth: 360,
  },
});
