import React from 'react';
import Lottie from 'lottie-react-native';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

interface LottieViewProps {
  source: any;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  style?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
}

export function LottieView({
  source,
  loop = true,
  autoplay = true,
  speed = 1,
  style,
  width = 200,
  height = 200,
}: LottieViewProps) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <Lottie
        source={source}
        loop={loop}
        autoPlay={autoplay}
        speed={speed}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
