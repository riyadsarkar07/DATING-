import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { DiscoveryCandidate } from '../../types/filters';
import { SwipeDirection } from '../../types/enums';
import { colors, radius, shadows } from '../../constants/theme';
import { distanceLabel } from '../../core/utils/distance';
import { heavyImpact } from '../../core/utils/haptics';

interface SwipeCardProps {
  candidate: DiscoveryCandidate;
  stackIndex: number;
  isTop: boolean;
  forceSwipe?: { direction: SwipeDirection; tick: number } | null;
  onSwipe: (direction: SwipeDirection) => void;
}

export function SwipeCard({ candidate, stackIndex, isTop, forceSwipe, onSwipe }: SwipeCardProps) {
  const { width, height } = useWindowDimensions();
  const cardWidth = width - 32;
  const cardHeight = height * 0.66;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoCount = candidate.photos?.length || 0;

  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  useEffect(() => {
    if (!forceSwipe) return;
    const { direction } = forceSwipe;
    if (direction === 'like') {
      translateX.value = withTiming(width * 1.5, { duration: 260 });
    } else if (direction === 'pass') {
      translateX.value = withTiming(-width * 1.5, { duration: 260 });
    } else {
      translateY.value = withTiming(-height, { duration: 320 });
    }
    setTimeout(() => runOnJS(onSwipeRef.current)(direction), 280);
  }, [forceSwipe, translateX, translateY, width, height]);

  const pan = Gesture.Pan()
    .maxPointers(1)
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const horizontal = Math.abs(e.translationX);
      const vertical = Math.abs(e.translationY);
      const velocityX = e.velocityX;
      if (horizontal > width * 0.22 || Math.abs(velocityX) > 1100) {
        const direction: SwipeDirection = e.translationX > 0 || velocityX > 0 ? 'like' : 'pass';
        translateX.value = withTiming((direction === 'like' ? 1 : -1) * width * 1.5, { duration: 260 });
        runOnJS(heavyImpact)();
        setTimeout(() => runOnJS(onSwipeRef.current)(direction), 280);
      } else if (vertical > height * 0.18 && e.translationY < 0) {
        translateY.value = withTiming(-height, { duration: 320 });
        runOnJS(heavyImpact)();
        setTimeout(() => runOnJS(onSwipeRef.current)('super_like'), 300);
      } else {
        translateX.value = withSpring(0, { damping: 18 });
        translateY.value = withSpring(0, { damping: 18 });
      }
    });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, width * 0.22], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: `${interpolate(translateX.value, [0, 200], [0, 14])}deg` }],
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -width * 0.22], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: `${interpolate(translateX.value, [0, -200], [0, -14])}deg` }],
  }));

  const superStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, -height * 0.12], [0, 1], Extrapolation.CLAMP),
  }));

  const stackStyle = useAnimatedStyle(() => {
    const scale = interpolate(stackIndex, [0, 1, 2], [1, 0.94, 0.88]);
    const ty = interpolate(stackIndex, [0, 1, 2], [0, 12, 24]);
    return { transform: [{ scale }, { translateY: ty }] };
  });

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 22}deg` },
    ],
  }));

  const style = isTop ? topStyle : stackStyle;

  const goNextPhoto = () => setPhotoIndex((i) => (i + 1) % Math.max(1, photoCount));
  const goPrevPhoto = () => setPhotoIndex((i) => (i - 1 + Math.max(1, photoCount)) % Math.max(1, photoCount));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.card,
          { width: cardWidth, height: cardHeight },
          style,
          stackIndex === 0 ? shadows.soft : null,
        ]}
      >
        <Pressable style={styles.imageLeft} onPress={goPrevPhoto} />
        <FastImage
          source={{ uri: candidate.photos?.[photoIndex] }}
          style={StyleSheet.absoluteFill}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Pressable style={styles.imageRight} onPress={goNextPhoto} />

        {photoCount > 1 ? (
          <View style={styles.dots}>
            {candidate.photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
            ))}
          </View>
        ) : null}

        {isTop ? (
          <>
            <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]}>
              <AppText variant="display" color={colors.green} style={styles.stampText}>
                LIKE
              </AppText>
            </Animated.View>
            <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]}>
              <AppText variant="display" color={colors.red} style={styles.stampText}>
                NOPE
              </AppText>
            </Animated.View>
            <Animated.View style={[styles.stamp, styles.superStamp, superStyle]}>
              <AppText variant="display" color={colors.aqua[400]} style={styles.stampText}>
                SUPER LIKE
              </AppText>
            </Animated.View>
          </>
        ) : null}

        <LinearGradient
          colors={['rgba(5,5,10,0)', 'rgba(5,5,10,0.92)']}
          style={styles.gradient}
          pointerEvents="none"
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <AppText variant="title" style={styles.name}>
              {candidate.displayName}, {candidate.age}
            </AppText>
            {candidate.verified ? <Badge kind="verified" /> : null}
            {candidate.premium ? <Badge kind="premium" /> : null}
          </View>
          <View style={styles.metaRow}>
            {candidate.online ? <Badge kind="super" label="Online" /> : null}
            {candidate.distanceKm !== null && candidate.distanceKm !== undefined ? (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary}>
                  {distanceLabel(candidate.distanceKm)}
                </AppText>
              </View>
            ) : null}
            {candidate.occupation ? (
              <View style={styles.metaItem}>
                <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary}>
                  {candidate.occupation}
                </AppText>
              </View>
            ) : null}
            {candidate.videoIntro ? (
              <Ionicons name="videocam" size={15} color={colors.blush[400]} />
            ) : null}
          </View>
          {candidate.bio ? (
            <AppText variant="caption" color={colors.offWhite} numberOfLines={2} style={styles.bio}>
              {candidate.bio}
            </AppText>
          ) : null}
          {candidate.mutualInterests?.length > 0 ? (
            <View style={styles.interests}>
              {candidate.mutualInterests.slice(0, 3).map((interest) => (
                <View key={interest} style={styles.interestChip}>
                  <Ionicons name="sparkles" size={11} color={colors.blush[400]} />
                  <AppText variant="caption" style={styles.interestText}>
                    {interest}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.ink[800],
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  imageLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: '100%',
    zIndex: 10,
  },
  imageRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '50%',
    height: '100%',
    zIndex: 10,
  },
  dots: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    zIndex: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: colors.white,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '62%',
    backgroundColor: 'transparent',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    backgroundColor: 'transparent',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 26,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bio: {
    marginBottom: 8,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  interestText: {
    color: colors.white,
    fontSize: 10,
  },
  stamp: {
    position: 'absolute',
    top: 70,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 4,
    zIndex: 20,
  },
  likeStamp: {
    left: 24,
    borderColor: colors.green,
    transform: [{ rotate: '-18deg' }],
  },
  nopeStamp: {
    right: 24,
    borderColor: colors.red,
    transform: [{ rotate: '18deg' }],
  },
  superStamp: {
    alignSelf: 'center',
    borderColor: colors.aqua[400],
    transform: [{ rotate: '-8deg' }],
  },
  stampText: {
    fontSize: 30,
    lineHeight: 36,
  },
});
