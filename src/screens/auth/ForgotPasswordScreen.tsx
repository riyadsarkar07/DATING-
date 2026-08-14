import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { AuthShell } from '../../components/auth/AuthShell';
import { AppInput } from '../../components/ui/AppInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { AppText } from '../../components/ui/AppText';
import { sendPasswordResetEmail } from '../../firebase/auth';
import { useAppStore } from '../../store/app.store';
import { colors } from '../../constants/theme';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const showToast = useAppStore((s) => s.showToast);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(getValues('email'));
      setSent(true);
      showToast('Reset link sent to your email', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll send you a link to reset your password"
      onBack={() => navigation.goBack()}
    >
      {sent ? (
        <>
          <AppText variant="body" color={colors.textSecondary} centered>
            Check your inbox at <AppText variant="label" color={colors.white}>{getValues('email')}</AppText>. Use the link
            to create a new password, then come back and log in.
          </AppText>
          <GradientButton
            title="Back to Login"
            onPress={() => (navigation as any).navigate('Login')}
            style={{ marginTop: 20 }}
          />
        </>
      ) : (
        <>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Email"
                icon="mail-outline"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />
          <GradientButton title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={submitting} />
          <AppText variant="caption" centered color={colors.textTertiary}>
            Remembered your password?{' '}
            <AppText variant="label" color={colors.aqua[400]} onPress={() => (navigation as any).navigate('Login')}>
              Log in
            </AppText>
          </AppText>
        </>
      )}
    </AuthShell>
  );
}
