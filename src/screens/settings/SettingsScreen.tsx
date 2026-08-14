import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../components/ui/AppText';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../constants/theme';

type Section = { title: string; rows: { icon: any; label: string; route: string; danger?: boolean }[] };

const SECTIONS: Section[] = [
  {
    title: 'Account',
    rows: [
      { icon: 'person-circle-outline', label: 'Edit profile', route: 'EditProfile' },
      { icon: 'shield-checkmark-outline', label: 'Verification', route: 'VerificationRequest' },
      { icon: 'lock-closed-outline', label: 'Security', route: 'Security' },
      { icon: 'ban-outline', label: 'Blocked users', route: 'BlockedUsers' },
      { icon: 'trash-outline', label: 'Delete account', route: 'DeleteAccount', danger: true },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { icon: 'language-outline', label: 'Language', route: 'Language' },
      { icon: 'notifications-outline', label: 'Notifications', route: 'NotificationSettings' },
      { icon: 'eye-outline', label: 'Privacy', route: 'Privacy' },
    ],
  },
  {
    title: 'Support',
    rows: [
      { icon: 'help-circle-outline', label: 'Help Center', route: 'HelpCenter' },
      { icon: 'mail-outline', label: 'Contact support', route: 'ContactSupport' },
    ],
  },
  {
    title: 'About',
    rows: [
      { icon: 'document-text-outline', label: 'Terms of service', route: 'Terms' },
      { icon: 'shield-outline', label: 'Privacy policy', route: 'PrivacyPolicy' },
      { icon: 'information-circle-outline', label: 'About SparkX', route: 'About' },
    ],
  },
];

export function SettingsScreen({ navigation }: any) {
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);

  const renderSection = (section: Section) => (
    <View key={section.title} style={styles.section}>
      <AppText variant="caption" color={colors.textTertiary} style={styles.sectionTitle}>
        {section.title.toUpperCase()}
      </AppText>
      <View style={styles.group}>
        {section.rows.map((row) => (
          <Pressable
            key={row.route}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate(row.route)}
          >
            <View style={[styles.rowIcon, row.danger && styles.dangerIcon]}>
              <Ionicons name={row.icon} size={18} color={row.danger ? colors.danger : colors.violet[400]} />
            </View>
            <AppText variant="body" style={{ flex: 1 }} color={row.danger ? colors.danger : colors.white}>
              {row.label}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={colors.white} />
            </Pressable>
            <AppText variant="subheading">Settings</AppText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.userCard}>
            <AppText variant="label" color={colors.white}>
              Signed in as {profile?.displayName ?? 'SparkX member'}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {profile?.email ?? ''}
            </AppText>
          </View>

          {SECTIONS.map(renderSection)}

          <Pressable
            style={styles.logoutBtn}
            onPress={() => {
              logout();
              (navigation as any).reset({ index: 0, routes: [{ name: 'Auth' }] });
            }}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <AppText variant="body" color={colors.danger}>
              Log out
            </AppText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    marginBottom: 16,
  },
  section: { marginBottom: 20 },
  sectionTitle: { marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  group: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  dangerIcon: { backgroundColor: 'rgba(244,63,94,0.12)' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(244,63,94,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.25)',
  },
});
