import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../../constants/theme';

type BadgeKind = 'verified' | 'premium' | 'super' | 'boost' | 'gold' | 'new';

interface BadgeProps {
  kind: BadgeKind;
  label?: string;
  size?: 'sm' | 'md';
}

const CONFIG: Record<BadgeKind, { icon: any; color: string; bg: string }> = {
  verified: { icon: 'shield-checkmark', color: '#38CFFC', bg: 'rgba(0,209,255,0.15)' },
  premium: { icon: 'diamond', color: '#FFC53D', bg: 'rgba(255,197,61,0.15)' },
  super: { icon: 'star', color: '#00D1FF', bg: 'rgba(0,209,255,0.15)' },
  boost: { icon: 'flash', color: '#FF3EA5', bg: 'rgba(255,62,165,0.18)' },
  gold: { icon: 'flame', color: '#F5A623', bg: 'rgba(245,166,35,0.18)' },
  new: { icon: 'sparkles', color: '#9D6FFF', bg: 'rgba(124,77,255,0.2)' },
};

export function Badge({ kind, label, size = 'md' }: BadgeProps) {
  const config = CONFIG[kind];
  const isSmall = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.small,
      ]}
    >
      <Ionicons name={config.icon} size={isSmall ? 10 : 12} color={config.color} />
      {label ? (
        <AppText variant="caption" color={config.color} style={styles.label}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    lineHeight: 12,
  },
});
