import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { AppModal } from '../../components/ui/AppModal';
import { AppInput } from '../../components/ui/AppInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { colors, radius } from '../../constants/theme';
import { selectionChanged } from '../../core/utils/haptics';

interface OptionPickerProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T | '';
  onChange: (value: T) => void;
  columns?: number;
}

export function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionPickerProps<T>) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color={colors.textSecondary} style={styles.label}>
        {label}
      </AppText>
      <View style={styles.chips}>
        {options.map((o) => (
          <Pressable
            key={o.value}
            onPress={async () => {
              await selectionChanged();
              onChange(o.value);
            }}
            style={[styles.chip, value === o.value && styles.chipActive]}
          >
            <AppText variant="label" color={value === o.value ? colors.white : colors.textSecondary}>
              {o.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface MultiOptionPickerProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
}

export function MultiOptionPicker({ label, options, value, onChange, max = 10 }: MultiOptionPickerProps) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (value.length < max) {
      onChange([...value, opt]);
    }
  };

  return (
    <View style={styles.field}>
      <AppText variant="label" color={colors.textSecondary} style={styles.label}>
        {label}
        <AppText variant="caption" color={colors.textTertiary}>
          {'  '}({value.length}/{max})
        </AppText>
      </AppText>
      <View style={styles.chips}>
        {options.map((opt) => {
          const selected = value.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => toggle(opt)}
              style={[styles.chip, selected && styles.chipActive]}
            >
              <AppText variant="label" color={selected ? colors.white : colors.textSecondary}>
                {opt}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface ListPickerModalProps<T extends string> {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: T[];
  value: T | '';
  onSelect: (value: T) => void;
  labels?: Record<string, string>;
}

export function ListPickerModal<T extends string>({
  visible,
  onClose,
  title,
  options,
  value,
  onSelect,
  labels,
}: ListPickerModalProps<T>) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter((o) => (labels?.[o] ?? o).toLowerCase().includes(q));
  }, [options, query, labels]);

  return (
    <AppModal visible={visible} onClose={onClose} heightRatio={0.75}>
      <View style={styles.modalHeader}>
        <AppText variant="heading">{title}</AppText>
      </View>
      <AppInput
        placeholder="Search..."
        value={query}
        onChangeText={setQuery}
        icon="search-outline"
        containerStyle={{ paddingHorizontal: 16 }}
      />
      <ScrollView contentContainerStyle={styles.modalList}>
        {filtered.map((o) => {
          const selected = value === o;
          return (
            <Pressable
              key={o}
              onPress={() => {
                onSelect(o);
                onClose();
              }}
              style={[styles.listRow, selected && styles.listRowActive]}
            >
              <AppText variant="body" color={selected ? colors.white : colors.textSecondary}>
                {labels?.[o] ?? o}
              </AppText>
            </Pressable>
          );
        })}
        {filtered.length === 0 ? (
          <AppText variant="body" color={colors.textTertiary} centered style={{ padding: 24 }}>
            No results
          </AppText>
        ) : null}
      </ScrollView>
    </AppModal>
  );
}

interface WizardHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle: string;
  progress: number;
}

export function WizardHeader({ step, total, title, subtitle, progress }: WizardHeaderProps) {
  return (
    <View style={styles.wizardHeader}>
      <View style={styles.stepRow}>
        <AppText variant="caption" color={colors.textTertiary}>
          STEP {step} OF {total}
        </AppText>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <AppText variant="title" style={styles.wizardTitle}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.wizardSubtitle}>
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  chipActive: {
    backgroundColor: colors.violet[600],
    borderColor: colors.violet[500],
  },
  modalHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  modalList: {
    padding: 16,
    gap: 6,
  },
  listRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceGlass,
  },
  listRowActive: {
    backgroundColor: colors.violet[600],
  },
  wizardHeader: {
    marginBottom: 24,
  },
  stepRow: {
    marginBottom: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceGlass,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FF3EA5',
  },
  wizardTitle: {
    marginBottom: 6,
  },
  wizardSubtitle: {
    maxWidth: 320,
  },
});
