import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../components/ui/AppText';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { GlassCard } from '../../components/ui/GlassCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuthStore } from '../../store/auth.store';
import { usePremiumStore } from '../../store/premium.store';
import { useProfileCompletion } from '../../hooks/useProfileCompletion';
import { colors } from '../../constants/theme';

type Row = { icon: any; label: string; route: string; danger?: boolean; value?: string };

export function ProfileTabScreen() {
  const navigation = useNavigation();
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const premiumTier = usePremiumStore((s) => s.premium.tier);
  const completion = useProfileCompletion();

  if (!profile) return null;

  const rows: Row[] = [
    { icon: 'settings-outline', label: 'Settings', route: 'Settings' },
    { icon: 'notifications-outline', label: 'Notifications', route: 'Notifications' },
    { icon: 'shield-checkmark-outline', label: 'Verification', route: 'VerificationRequest' },
    { icon: 'diamond-outline', label: 'Premium', route: 'Premium', value: premiumTier ?? undefined },
    { icon: 'cash-outline', label: 'Coins', route: 'Coins' },
    { icon: 'time-outline', label: 'Call History', route: 'CallHistory' },
  ];

  const renderRow = (row: Row) => (
    <Pressable
      key={row.route}
      style={styles.row}
      onPress={() => (navigation as any).navigate(row.route)}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={row.icon} size={18} color={row.danger ? colors.danger : colors.violet[400]} />
      </View>
      <AppText variant="body" style={{ flex: 1 }} color={row.danger ? colors.danger : colors.white}>
        {row.label}
      </AppText>
      {row.value ? (
        <Badge kind="gold" label={row.value} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
    </Pressable>
  );

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <AppText variant="subheading">Profile</AppText>
            <Pressable onPress={() => (navigation as any).navigate('EditProfile')} hitSlop={10}>
              <Ionicons name="create-outline" size={24} color={colors.violet[400]} />
            </Pressable>
          </View>

          <LinearGradient
            colors={['rgba(124,58,237,0.35)', 'rgba(255,62,165,0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <Avatar uri={profile.photos[0]} size={92} />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <AppText variant="title">{profile.displayName}</AppText>
                {profile.verified && <Badge kind="verified" />}
              </View>
              <AppText variant="caption" color={colors.textSecondary}>
                {profile.age} years old · {profile.city || 'Location hidden'}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {profile.occupation || 'SparkX member'}
              </AppText>
            </View>
          </LinearGradient>

          <GlassCard style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <AppText variant="body">Profile strength</AppText>
              <AppText variant="caption" color={colors.blush[500]}>
                {completion}%
              </AppText>
            </View>
            <ProgressBar progress={completion / 100} />
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 8 }}>
              {completion >= 100
                ? 'Your profile is complete. Great job!'
                : 'Complete more details to get better matches.'}
            </AppText>
          </GlassCard>

          <View style={styles.section}>{rows.map(renderRow)}</View>

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
          <AppText variant="caption" color={colors.textTertiary} centered style={styles.version}>
            SparkX v1.0.0
          </AppText>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completionCard: { marginTop: 16 },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  section: {
    marginTop: 20,
    borderRadius: 20,
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
    paddingVertical: 15,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(244,63,94,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.25)',
  },
  version: { marginTop: 20 },
});
