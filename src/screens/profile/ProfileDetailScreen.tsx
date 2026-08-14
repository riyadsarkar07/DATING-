import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../components/ui/AppText';
import { Badge } from '../../components/ui/Badge';
import { Chip } from '../../components/ui/Chip';
import { AppModal } from '../../components/ui/AppModal';
import { GradientButton } from '../../components/ui/GradientButton';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { userService } from '../../services/user.service';
import { matchService } from '../../services/match.service';
import { reportService } from '../../services/report.service';
import { UserProfile } from '../../types/user';
import { colors } from '../../constants/theme';

const REPORT_REASONS = ['Fake profile', 'Harassment', 'Inappropriate content', 'Scam', 'Underage user', 'Other'];

export function ProfileDetailScreen({ navigation, route }: any) {
  const { uid } = route.params;
  const me = useAuthStore((s) => s.profile);
  const showToast = useAppStore((s) => s.showToast);
  const { width } = useWindowDimensions();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    userService.getProfile(uid).then((p) => {
      if (mounted) setProfile(p);
    });
    if (me) {
      matchService.getMatchByUsers(me.uid, uid).then((m) => {
        if (mounted && m) setMatchId(m.id);
      });
    }
    return () => {
      mounted = false;
    };
  }, [uid, me]);

  if (!profile) {
    return (
      <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={colors.white} />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <AppText variant="caption" color={colors.textSecondary}>
              Loading profile...
            </AppText>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const submitReport = async () => {
    if (!reportReason || !me) return;
    setSubmitting(true);
    try {
      await reportService.submit({
        reporterUid: me.uid,
        targetUid: uid,
        reason: reportReason,
        details: reportDetails,
      });
      showToast('Report submitted. Thank you.', 'success');
      setReportOpen(false);
      setReportDetails('');
    } catch {
      showToast('Could not submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setReportOpen(true)} hitSlop={10} style={styles.headerBtn}>
              <Ionicons name="flag-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {profile.photos?.length ? (
            <View style={[styles.hero, { height: width * 1.1 }]}>
              <FastImage source={{ uri: profile.photos[0] }} style={StyleSheet.absoluteFill} resizeMode={FastImage.resizeMode.cover} />
              <LinearGradient colors={['rgba(5,5,10,0)', 'rgba(5,5,10,0.9)']} style={StyleSheet.absoluteFill} />
              <View style={styles.heroBottom}>
                <View style={styles.nameRow}>
                  <AppText variant="title" style={styles.heroName}>
                    {profile.displayName}, {profile.age}
                  </AppText>
                  {profile.verified && <Badge kind="verified" />}
                  {profile.premium && <Badge kind="premium" />}
                </View>
                <AppText variant="caption" color={colors.textSecondary}>
                  {profile.city || 'Location hidden'} · {profile.online ? 'Online' : 'Offline'}
                </AppText>
              </View>
            </View>
          ) : (
            <View style={[styles.hero, { height: width * 0.8, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={80} color={colors.textTertiary} />
            </View>
          )}

          {profile.bio ? (
            <View style={styles.section}>
              <AppText variant="subheading">About</AppText>
              <AppText variant="body" color={colors.textSecondary}>
                {profile.bio}
              </AppText>
            </View>
          ) : null}

          <View style={styles.chips}>
            {profile.occupation ? (
              <Chip icon={<Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />} label={profile.occupation} onPress={() => {}} />
            ) : null}
            {profile.height ? (
              <Chip icon={<Ionicons name="resize-outline" size={14} color={colors.textSecondary} />} label={`${profile.height} cm`} onPress={() => {}} />
            ) : null}
            {profile.religion ? <Chip label={profile.religion} onPress={() => {}} /> : null}
            {profile.education ? <Chip label={profile.education} onPress={() => {}} /> : null}
          </View>

          {profile.hobbies?.length ? (
            <View style={styles.section}>
              <AppText variant="subheading">Interests</AppText>
              <View style={styles.chips}>
                {profile.hobbies.map((h) => (
                  <Chip key={h} label={h} onPress={() => {}} />
                ))}
              </View>
            </View>
          ) : null}

          {profile.languages?.length ? (
            <View style={styles.section}>
              <AppText variant="subheading">Languages</AppText>
              <View style={styles.chips}>
                {profile.languages.map((l) => (
                  <Chip key={l} label={l} onPress={() => {}} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            <GradientButton
              title={matchId ? 'Send a message' : 'Not a match yet'}
              variant={matchId ? 'primary' : 'ghost'}
              icon={<Ionicons name={matchId ? 'chatbubble-ellipses' : 'lock-closed'} size={16} color={matchId ? colors.white : colors.textSecondary} />}
              disabled={!matchId}
              onPress={() => matchId && navigation.replace('ChatRoom', { matchId })}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <AppModal visible={reportOpen} onClose={() => setReportOpen(false)} heightRatio={0.6}>
        <View style={styles.modalTitleRow}>
          <AppText variant="subheading">Report user</AppText>
          <Pressable onPress={() => setReportOpen(false)} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
          Help us keep SparkX safe. Choose a reason for this report.
        </AppText>
        {REPORT_REASONS.map((reason) => (
          <Pressable
            key={reason}
            style={[styles.reasonRow, reportReason === reason && styles.reasonActive]}
            onPress={() => setReportReason(reason)}
          >
            <AppText variant="body">{reason}</AppText>
            {reportReason === reason && <Ionicons name="checkmark-circle" size={18} color={colors.violet[400]} />}
          </Pressable>
        ))}
        <GradientButton
          title="Submit report"
          variant="danger"
          disabled={!reportReason}
          loading={submitting}
          onPress={submitReport}
          style={{ marginTop: 12 }}
        />
      </AppModal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244,63,94,0.12)',
  },
  content: { paddingBottom: 40 },
  hero: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroBottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroName: { color: colors.white },
  section: { paddingHorizontal: 20, marginTop: 20 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  actions: { paddingHorizontal: 20, marginTop: 24 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  reasonActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
});
