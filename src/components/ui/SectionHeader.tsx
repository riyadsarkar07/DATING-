import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
  onRightPress?: () => void;
  rightLabel?: string;
}

export function SectionHeader({ title, right, onRightPress, rightLabel }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="subheading">{title}</AppText>
      {rightLabel ? (
        <AppText variant="label" color={colors.violet[400]} onPress={onRightPress}>
          {rightLabel}
        </AppText>
      ) : (
        right
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
