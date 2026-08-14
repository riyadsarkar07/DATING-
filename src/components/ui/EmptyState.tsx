import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { GradientButton } from './GradientButton';
import { colors } from '../../constants/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'heart-outline', title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={44} color={colors.violet[400]} />
      </View>
      <AppText variant="heading" centered>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" color={colors.textSecondary} centered style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <GradientButton title={actionLabel} onPress={onAction} compact style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 12,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(124,77,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 4,
    maxWidth: 280,
  },
  action: {
    marginTop: 12,
  },
});
