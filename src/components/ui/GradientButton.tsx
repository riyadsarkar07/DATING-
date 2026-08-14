import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { colors, radius, shadows } from '../../constants/theme';
import { mediumImpact } from '../../core/utils/haptics';

type Variant = 'primary' | 'outline' | 'ghost' | 'gold' | 'premium' | 'danger';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  compact?: boolean;
}

const GRADIENTS: Record<Variant, readonly [string, string]> = {
  primary: ['#7C4DFF', '#FF3EA5'],
  gold: ['#FFC53D', '#F5A623'],
  premium: ['#FF3EA5', '#7C4DFF'],
  danger: ['#FF5B79', '#D1107C'],
  outline: ['transparent', 'transparent'],
  ghost: ['transparent', 'transparent'],
};

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  icon,
  compact,
}: GradientButtonProps) {
  const isTransparent = variant === 'outline' || variant === 'ghost';

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={async () => {
        await mediumImpact();
        onPress();
      }}
      style={({ pressed }) => [
        styles.wrapper,
        compact && styles.compact,
        pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.45 },
        isTransparent && styles.transparentWrapper,
        style,
      ]}
    >
      {isTransparent ? (
        <View
          style={[
            styles.inner,
            variant === 'outline' && styles.outlineInner,
          ]}
        >
          {icon}
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <AppText
              variant="label"
              color={variant === 'outline' ? colors.white : colors.textSecondary}
              style={styles.title}
            >
              {title}
            </AppText>
          )}
        </View>
      ) : (
        <LinearGradient colors={GRADIENTS[variant]} style={styles.inner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {icon}
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <AppText variant="label" color={colors.white} style={styles.title}>
              {title}
            </AppText>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.glowViolet,
  },
  compact: {
    alignSelf: 'flex-start',
    minWidth: 120,
  },
  transparentWrapper: {
    shadowOpacity: 0,
    elevation: 0,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 54,
    gap: 8,
  },
  outlineInner: {
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceGlass,
  },
  title: {
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
