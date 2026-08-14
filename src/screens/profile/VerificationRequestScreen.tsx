import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { SafeImage } from '../../components/common/SafeImage';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { verificationService } from '../../services/verification.service';
import { useMediaPicker } from '../../hooks/useMediaPicker';
import { colors, radius } from '../../constants/theme';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

const STATUS_LABEL: Record<VerificationStatus, { text: string; color: string }> = {
  pending: { text: 'Verification in review', color: '#FFC107' },
  approved: { text: 'Verified', color: colors.green },
  rejected: { text: 'Verification rejected', color: colors.red },
};

export function VerificationRequestScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const showToast = useAppStore((s) => s.showToast);
  const { pickImage } = useMediaPicker();

  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [idCard, setIdCard] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!uid) return;
    verificationService.getLatestStatus(uid).then((s) => s && setStatus(s.status));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const pick = async (kind: 'selfie' | 'id') => {
    const asset = await pickImage();
    if (!asset) return;
    if (kind === 'selfie') setSelfie(asset.uri);
    else setIdCard(asset.uri);
  };

  const submit = async () => {
    if (!uid || !selfie || !idCard) {
      showToast('Upload both photos to continue', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await verificationService.submit(uid, selfie, idCard);
      setStatus('pending');
      showToast('Submitted for review', 'success');
    } catch {
      showToast('Upload failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (status) {
    const cfg = STATUS_LABEL[status];
    return (
      <Screen headerTitle="Verification" onBack={navigation.goBack}>
        <GlassCard style={styles.statusCard}>
          <Ionicons
            name={status === 'approved' ? 'shield-checkmark' : status === 'rejected' ? 'shield-outline' : 'time-outline'}
            size={48}
            color={cfg.color}
          />
          <AppText variant="subheading" style={{ color: cfg.color }}>
            {cfg.text}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            {status === 'approved'
              ? 'Your profile is verified.'
              : status === 'rejected'
                ? 'Your photos did not pass review. Submit again with clearer photos.'
                : 'We are reviewing your photos. This usually takes less than 24 hours.'}
          </AppText>
          {status === 'rejected' ? (
            <GradientButton
              title="Submit again"
              onPress={() => {
                setStatus(null);
                setSelfie(null);
                setIdCard(null);
              }}
            />
          ) : null}
        </GlassCard>
      </Screen>
    );
  }

  return (
    <Screen headerTitle="Verification" onBack={navigation.goBack} scroll>
      <AppText variant="body" color={colors.textSecondary} style={styles.intro}>
        Upload a clear selfie holding a photo ID to verify your profile. Verified profiles get a blue badge and higher visibility.
      </AppText>

      <View style={styles.uploadRow}>
        <UploadBox label="Your selfie" uri={selfie} onPick={() => pick('selfie')} />
        <UploadBox label="Photo ID" uri={idCard} onPick={() => pick('id')} />
      </View>

      <GradientButton
        title="Submit for review"
        onPress={submit}
        loading={submitting}
        disabled={!selfie || !idCard}
      />
    </Screen>
  );
}

function UploadBox({ label, uri, onPick }: { label: string; uri: string | null; onPick: () => void }) {
  return (
    <Pressable onPress={onPick} style={styles.uploadBox}>
      {uri ? (
        <SafeImage uri={uri} style={styles.uploadImg} />
      ) : (
        <>
          <Ionicons name="camera-outline" size={34} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  uploadBox: {
    flex: 1,
    height: 190,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderGlass,
    backgroundColor: colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  uploadImg: {
    width: '100%',
    height: '100%',
  },
  statusCard: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
});
