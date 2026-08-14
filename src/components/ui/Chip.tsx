import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radius } from '../../constants/theme';
import { selectionChanged } from '../../core/utils/haptics';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  return (
    <Pressable
      onPress={async () => {
        await selectionChanged();
        onPress();
      }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <AppText
        variant="label"
        color={selected ? colors.white : colors.textSecondary}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  chipSelected: {
    backgroundColor: colors.violet[600],
    borderColor: colors.violet[500],
  },
  icon: {
    marginRight: 2,
  },
});
