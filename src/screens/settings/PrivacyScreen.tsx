import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { useSettingsStore } from '../../store/settings.store';
import { colors, radius } from '../../constants/theme';

export function PrivacyScreen({ navigation }: any) {
  const settings = useSettingsStore((s) => s.settings);
  const setPrivacyPrefs = useSettingsStore((s) => s.setPrivacyPrefs);
  const prefs = settings?.privacyPrefs;

  if (!prefs) return null;

  const rows: { key: keyof typeof prefs; label: string; sub: string }[] = [
    { key: 'showOnlineStatus', label: 'Show online status', sub: 'Let others see when you are online' },
    { key: 'showDistance', label: 'Show distance', sub: 'Display your distance in km' },
    { key: 'showAge', label: 'Show age', sub: 'Display your age on your profile' },
    { key: 'showPhotosToNonMatched', label: 'Show photos to everyone', sub: 'Photos visible before matching' },
    { key: 'discoverable', label: 'Discoverable', sub: 'Appear in discovery and search' },
  ];

  const toggle = async (key: keyof typeof prefs) => {
    await setPrivacyPrefs({ ...prefs, [key]: !prefs[key] });
  };

  return (
    <Screen headerTitle="Privacy" onBack={navigation.goBack} scroll>
      <View style={styles.list}>
        {rows.map((row) => (
          <Pressable key={row.key} onPress={() => toggle(row.key)} style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText variant="body">{row.label}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>{row.sub}</AppText>
            </View>
            <Ionicons
              name={prefs[row.key] ? 'toggle' : 'toggle-outline'}
              size={30}
              color={prefs[row.key] ? colors.violet[500] : colors.textTertiary}
            />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginBottom: 8,
  },
});
