import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { AuthShell } from '../../components/auth/AuthShell';
import { AppInput } from '../../components/ui/AppInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { AppText } from '../../components/ui/AppText';
import { authService } from '../../services/auth.service';
import { useAppStore } from '../../store/app.store';
import { SignupFormValues } from '../../types/api';
import { colors } from '../../constants/theme';
import { logEvent } from '../../firebase/analytics';

const schema = z
  .object({
    displayName: z.string().min(2, 'Enter your name (at least 2 characters)'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function SignupScreen() {
  const navigation = useNavigation();
  const showToast = useAppStore((s) => s.showToast);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitting(true);
    try {
      await authService.handleSignUp({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
      });
      logEvent('signup', { method: 'email' });
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Join SparkX and find meaningful connections"
      onBack={() => navigation.goBack()}
    >
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Name"
            icon="person-outline"
            placeholder="How should we call you?"
            value={value}
            onChangeText={onChange}
            error={errors.displayName?.message}
          />
        )}
      />
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
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Password"
            icon="lock-closed-outline"
            placeholder="Min 6 characters"
            secure
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Confirm password"
            icon="shield-checkmark-outline"
            placeholder="Repeat password"
            secure
            value={value}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />
      <GradientButton title="Create Account" onPress={handleSubmit(onSubmit)} loading={submitting} />
      <Pressable onPress={() => (navigation as any).goBack()} hitSlop={8}>
        <AppText variant="label" centered color={colors.textSecondary}>
          Already have an account? <AppText variant="label" color={colors.blush[400]}>Log in</AppText>
        </AppText>
      </Pressable>
      <View style={styles.privacyNote}>
        <AppText variant="caption" centered color={colors.textTertiary}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </AppText>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  privacyNote: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
