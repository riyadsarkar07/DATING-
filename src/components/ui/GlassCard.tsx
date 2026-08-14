import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, shadows, radius } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blur?: boolean;
  padding?: number;
  borderRadius?: number;
  strong?: boolean;
}

export function GlassCard({
  children,
  style,
  padding = 16,
  borderRadius = radius.lg,
  strong = false,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          borderRadius,
          backgroundColor: strong ? colors.surfaceGlassStrong : colors.surfaceGlass,
        },
        shadows.soft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.borderGlass,
    overflow: 'hidden',
  },
});
