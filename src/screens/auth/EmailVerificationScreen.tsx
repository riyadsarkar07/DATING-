import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../components/ui/AppText';
import { GradientButton } from '../../components/ui/GradientButton';
import {
  sendEmailVerification,
  refreshEmailVerification,
  getCurrentUser,
} from '../../firebase/auth';
import { useAppStore } from '../../store/app.store';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../constants/theme';

export function EmailVerificationScreen() {
  const navigation = useNavigation();
  const showToast = useAppStore((s) => s.showToast);
  const setIncompleteProfile = useAuthStore((s) => s.setIncompleteProfile);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    setEmail(getCurrentUser()?.email ?? '');
  }, []);

  const send = async () => {
    setSending(true);
    try {
      await sendEmailVerification();
      showToast('Verification email sent', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSending(false);
    }
  };

  const check = async () => {
    setChecking(true);
    try {
      const verified = await refreshEmailVerification();
      if (verified) {
        showToast('Email verified', 'success');
        (navigation as any).reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
      } else {
        showToast('Email not verified yet. Check your inbox.', 'info');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <LinearGradient colors={['#05050A', '#140A24']} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="mail-unread-outline" size={44} color={colors.aqua[400]} />
          </View>
          <AppText variant="title" centered style={styles.title}>
            Verify your email
          </AppText>
          <AppText variant="body" color={colors.textSecondary} centered style={styles.subtitle}>
            We sent a verification link to <AppText variant="label" color={colors.white}>{email || 'your email'}</AppText>.
            Tap the link in the email to activate your account.
          </AppText>
          <GradientButton title="I've verified — continue" onPress={check} loading={checking} style={styles.button} />
          <GradientButton
            title="Resend verification email"
            onPress={send}
            loading={sending}
            variant="outline"
            style={styles.button}
          />
          <AppText variant="label" centered color={colors.textTertiary} onPress={() => setIncompleteProfile()}>
            Skip for now
          </AppText>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,209,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    marginBottom: 28,
    maxWidth: 320,
  },
  button: {
    width: '100%',
    marginBottom: 14,
  },
});
