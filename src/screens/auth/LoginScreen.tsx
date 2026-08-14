import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { AuthShell } from '../../components/auth/AuthShell';
import { AppInput } from '../../components/ui/AppInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { SocialButton } from '../../components/auth/SocialButton';
import { AppText } from '../../components/ui/AppText';
import { authService } from '../../services/auth.service';
import { useAppStore } from '../../store/app.store';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { LoginFormValues } from '../../types/api';
import { colors } from '../../constants/theme';
import { logEvent } from '../../firebase/analytics';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginScreen() {
  const navigation = useNavigation();
  const showToast = useAppStore((s) => s.showToast);
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await authService.handleLogin(values.email, values.password);
      logEvent('login', { method: 'email' });
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue finding your spark"
      footer={
        <View style={styles.footer}>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <AppText variant="caption" color={colors.textTertiary}>
              OR CONTINUE WITH
            </AppText>
            <View style={styles.divider} />
          </View>
          <SocialButton label="Continue with Google" onPress={handleGoogle} loading={googleLoading} provider="google" />
          <Pressable onPress={() => (navigation as any).navigate('Signup')} hitSlop={8}>
            <AppText variant="label" centered color={colors.textSecondary} style={styles.switchText}>
              New to SparkX? <AppText variant="label" color={colors.blush[400]}>Create account</AppText>
            </AppText>
          </Pressable>
        </View>
      }
    >
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
            placeholder="••••••••"
            secure
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Pressable onPress={() => (navigation as any).navigate('ForgotPassword')} style={styles.forgot} hitSlop={8}>
        <AppText variant="label" color={colors.violet[400]}>
          Forgot password?
        </AppText>
      </Pressable>
      <GradientButton title="Log In" onPress={handleSubmit(onSubmit)} loading={submitting} />
      <Pressable onPress={() => (navigation as any).navigate('PhoneSignIn')} hitSlop={8}>
        <AppText variant="label" centered color={colors.textSecondary}>
          or <AppText variant="label" color={colors.aqua[400]}>continue with phone</AppText>
        </AppText>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  footer: {
    gap: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderGlass,
  },
  switchText: {
    textAlign: 'center',
  },
});
