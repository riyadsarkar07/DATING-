import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/theme';

interface ProgressBarProps {
  progress: number;
  height?: number;
}

export function ProgressBar({ progress, height = 8 }: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(1, Math.max(0, progress)), {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, animatedStyle]}>
        <LinearGradient
          colors={['#7C4DFF', '#FF3EA5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: colors.surfaceGlass,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  gradient: {
    flex: 1,
    borderRadius: 999,
  },
});
