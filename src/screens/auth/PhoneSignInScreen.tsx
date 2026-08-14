import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthShell } from '../../components/auth/AuthShell';
import { AppInput } from '../../components/ui/AppInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { AppText } from '../../components/ui/AppText';
import { authService } from '../../services/auth.service';
import { useAppStore } from '../../store/app.store';
import { colors } from '../../constants/theme';
import { isValidPhone } from '../../core/utils/validation';

const COUNTRY_CODES = ['+1', '+44', '+91', '+61', '+49', '+33', '+86', '+81', '+82', '+971'];

export function PhoneSignInScreen() {
  const navigation = useNavigation();
  const showToast = useAppStore((s) => s.showToast);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fullNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

  const sendCode = async () => {
    if (!isValidPhone(fullNumber)) {
      showToast('Enter a valid phone number', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const verificationId = await authService.handlePhoneOtp(fullNumber);
      (navigation as any).navigate('OtpVerification', { verificationId, phoneNumber: fullNumber });
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Your phone number"
      subtitle="We'll send a one-time verification code"
      onBack={() => navigation.goBack()}
    >
      <View style={styles.row}>
        <View style={styles.codePicker}>
          {COUNTRY_CODES.map((code) => (
            <Pressable
              key={code}
              onPress={() => setCountryCode(code)}
              style={[styles.codeChip, countryCode === code && styles.codeChipActive]}
            >
              <AppText variant="label" color={countryCode === code ? colors.white : colors.textSecondary}>
                {code}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
      <AppInput
        label="Phone number"
        icon="call-outline"
        placeholder="555 000 1234"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={(t) => setPhoneNumber(t.replace(/[^\d]/g, ''))}
        maxLength={12}
      />
      <GradientButton title="Send Code" onPress={sendCode} loading={submitting} />
      <AppText variant="caption" centered color={colors.textTertiary}>
        Standard SMS rates may apply. You will receive a 6-digit verification code.
      </AppText>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
  },
  codePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  codeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  codeChipActive: {
    backgroundColor: colors.violet[600],
    borderColor: colors.violet[500],
  },
});
