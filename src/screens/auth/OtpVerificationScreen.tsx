import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthShell } from '../../components/auth/AuthShell';
import { OtpInput } from '../../components/auth/OtpInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { AppText } from '../../components/ui/AppText';
import { authService } from '../../services/auth.service';
import { useAppStore } from '../../store/app.store';
import { AuthStackParamList } from '../../navigation/types';
import { colors } from '../../constants/theme';
import { isValidOtp } from '../../core/utils/validation';

type Route = RouteProp<AuthStackParamList, 'OtpVerification'>;

export function OtpVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const showToast = useAppStore((s) => s.showToast);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const verify = async (c: string) => {
    if (!isValidOtp(c)) return;
    setSubmitting(true);
    try {
      await authService.handleVerifyOtp(route.params.verificationId, c);
      showToast('Signed in successfully', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      const verificationId = await authService.handlePhoneOtp(route.params.phoneNumber);
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((v) => {
          if (v <= 1) clearInterval(timer);
          return v - 1;
        });
      }, 1000);
      (navigation as any).setParams({ verificationId });
      showToast('Code re-sent', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  return (
    <AuthShell
      title="Enter code"
      subtitle={`We sent a 6-digit code to ${route.params.phoneNumber}`}
      onBack={() => navigation.goBack()}
    >
      <OtpInput
        length={6}
        value={code}
        onChangeText={(v) => {
          setCode(v);
          if (isValidOtp(v)) verify(v);
        }}
      />
      <GradientButton
        title="Verify"
        onPress={() => verify(code)}
        loading={submitting}
        style={{ marginTop: 8 }}
      />
      <Pressable onPress={resend} hitSlop={8}>
        <AppText variant="label" centered color={colors.aqua[400]}>
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </AppText>
      </Pressable>
    </AuthShell>
  );
}
