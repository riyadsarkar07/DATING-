import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { colors, shadows } from '../../constants/theme';
import { mediumImpact } from '../../core/utils/haptics';

interface ActionBarProps {
  onRewind: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  onBoost: () => void;
  disabled?: boolean;
  superLikesLeft?: number;
}

interface RoundButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
  glass?: boolean;
  gradient?: readonly [string, string];
  disabled?: boolean;
}

function RoundButton({ onPress, children, size = 56, glass, gradient, disabled }: RoundButtonProps) {
  const content = glass ? (
    <View style={[styles.round, { width: size, height: size, borderRadius: size / 2 }]}>{children}</View>
  ) : (
    <LinearGradient
      colors={gradient!}
      style={[styles.round, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {children}
    </LinearGradient>
  );
  return (
    <Pressable
      disabled={disabled}
      onPress={async () => {
        await mediumImpact();
        onPress();
      }}
      style={({ pressed }) => [pressed && { transform: [{ scale: 0.92 }] }, disabled && { opacity: 0.4 }]}
    >
      {content}
    </Pressable>
  );
}

export function ActionBar({
  onRewind,
  onPass,
  onSuperLike,
  onLike,
  onBoost,
  disabled,
  superLikesLeft = 1,
}: ActionBarProps) {
  return (
    <View style={styles.bar}>
      <RoundButton onPress={onBoost} size={44} glass>
        <Ionicons name="flash" size={20} color="#F5A623" />
      </RoundButton>
      <RoundButton onPress={onRewind} size={44} glass>
        <Ionicons name="refresh" size={20} color={colors.textSecondary} />
      </RoundButton>
      <RoundButton onPress={onPass} size={60} glass disabled={disabled}>
        <Ionicons name="close" size={26} color="#FF5B79" />
      </RoundButton>
      <View>
        <RoundButton onPress={onSuperLike} size={50} gradient={['#00D1FF', '#7C4DFF']} disabled={disabled || superLikesLeft <= 0}>
          <Ionicons name="star" size={22} color={colors.white} />
        </RoundButton>
        {superLikesLeft <= 0 ? (
          <AppText variant="caption" color={colors.aqua[400]} style={styles.leftLabel}>
            out
          </AppText>
        ) : null}
      </View>
      <RoundButton onPress={onLike} size={60} gradient={['#FF3EA5', '#7C4DFF']} disabled={disabled}>
        <Ionicons name="heart" size={28} color={colors.white} />
      </RoundButton>
      <RoundButton onPress={onBoost} size={44} glass>
        <Ionicons name="star-outline" size={20} color={colors.gold[400]} />
      </RoundButton>
      <RoundButton onPress={onBoost} size={44} glass>
        <Ionicons name="options" size={20} color={colors.textSecondary} />
      </RoundButton>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    ...shadows.soft,
  },
  leftLabel: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 2,
  },
});
