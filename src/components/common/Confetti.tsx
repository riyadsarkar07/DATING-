import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

const COLORS = ['#FF3EA5', '#7C4DFF', '#00D1FF', '#FFC53D', '#3DDC97', '#FFFFFF'];
const { width: SCREEN_W } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotation: number;
}

interface ConfettiProps {
  active: boolean;
  count?: number;
}

export function Confetti({ active, count = 60 }: ConfettiProps) {
  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * SCREEN_W,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        duration: 1600 + Math.random() * 1600,
        delay: Math.random() * 600,
        rotation: Math.random() * 360,
      })),
    [count],
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {active ? pieces.map((p) => <Piece key={p.id} piece={p} />) : null}
    </View>
  );
}

function Piece({ piece }: { piece: ConfettiPiece }) {
  const translateY = useSharedValue(-40);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      piece.delay,
      withTiming(1000, { duration: piece.duration, easing: Easing.in(Easing.quad) }),
    );
    translateX.value = withDelay(
      piece.delay,
      withTiming((Math.random() - 0.5) * 160, { duration: piece.duration, easing: Easing.linear }),
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + (Math.random() > 0.5 ? 720 : -720), {
        duration: piece.duration,
        easing: Easing.linear,
      }),
    );
    opacity.value = withDelay(piece.delay + piece.duration * 0.7, withTiming(0, { duration: 400 }));
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(rotate);
      cancelAnimation(opacity);
    };
  }, [piece, translateY, translateX, rotate, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: piece.x,
          width: piece.size,
          height: piece.size * 1.6,
          backgroundColor: piece.color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});
