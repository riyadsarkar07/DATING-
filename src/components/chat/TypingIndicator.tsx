import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../constants/theme';

export function TypingIndicator() {
  return (
    <View style={styles.wrap}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 450, easing: Easing.inOut(Easing.quad) }), -1, false),
    );
    return () => {
      progress.value = 0;
    };
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * 5 }],
    opacity: 0.4 + progress.value * 0.6,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceGlassStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.violet[300],
  },
});
