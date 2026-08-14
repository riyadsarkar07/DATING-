import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { useSettingsStore } from '../../store/settings.store';
import { colors, radius } from '../../constants/theme';

export function NotificationSettingsScreen({ navigation }: any) {
  const settings = useSettingsStore((s) => s.settings);
  const setNotificationPrefs = useSettingsStore((s) => s.setNotificationPrefs);
  const prefs = settings?.notificationPrefs;

  if (!prefs) return null;

  const rows: { key: keyof typeof prefs; label: string; icon: any }[] = [
    { key: 'likes', label: 'Likes', icon: 'heart-outline' },
    { key: 'matches', label: 'Matches', icon: 'sparkles-outline' },
    { key: 'messages', label: 'Messages', icon: 'chatbubble-outline' },
    { key: 'visitors', label: 'Profile views', icon: 'eye-outline' },
    { key: 'premium', label: 'Premium & offers', icon: 'diamond-outline' },
    { key: 'system', label: 'System updates', icon: 'notifications-outline' },
  ];

  const toggle = async (key: keyof typeof prefs) => {
    await setNotificationPrefs({ ...prefs, [key]: !prefs[key] });
  };

  return (
    <Screen headerTitle="Notifications" onBack={navigation.goBack} scroll>
      <View style={styles.list}>
        {rows.map((row) => (
          <Pressable key={row.key} onPress={() => toggle(row.key)} style={styles.row}>
            <Ionicons name={row.icon} size={20} color={colors.textSecondary} />
            <AppText variant="body" style={{ flex: 1 }}>
              {row.label}
            </AppText>
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
