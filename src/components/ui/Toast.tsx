import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useAppStore } from '../../store/app.store';
import { AppText } from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows } from '../../constants/theme';

export function Toast() {
  const toast = useAppStore((s) => s.toast);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    if (!toast) return;
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 250 });
    opacity.value = withDelay(2100, withTiming(0, { duration: 250 }));
    translateY.value = withDelay(2100, withTiming(24, { duration: 250 }));
  }, [toast, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!toast) return null;

  const icon =
    toast.type === 'success' ? 'checkmark-circle' : toast.type === 'error' ? 'alert-circle' : 'information-circle';
  const color =
    toast.type === 'success' ? colors.green : toast.type === 'error' ? colors.red : colors.aqua[400];

  return (
    <Animated.View style={[styles.toast, style]} pointerEvents="none">
      <Ionicons name={icon} size={18} color={color} />
      <AppText variant="label" style={styles.text}>
        {toast.message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.ink[700],
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: '85%',
    zIndex: 999,
    ...shadows.soft,
  },
  text: {
    flexShrink: 1,
  },
});
