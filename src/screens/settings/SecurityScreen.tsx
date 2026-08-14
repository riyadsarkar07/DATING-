import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { AppInput } from '../../components/ui/AppInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { reauthenticate, updatePassword } from '../../firebase/auth';
import { colors } from '../../constants/theme';

export function SecurityScreen({ navigation }: any) {
  const email = useAuthStore((s) => s.email);
  const showToast = useAppStore((s) => s.showToast);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!current || !next || next.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (next !== confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setBusy(true);
    try {
      await reauthenticate(current);
      await updatePassword(next);
      showToast('Password updated', 'success');
      navigation.goBack();
    } catch {
      showToast('Current password is incorrect', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen headerTitle="Security" onBack={navigation.goBack} scroll>
      <View style={styles.info}>
        <Ionicons name="shield-checkmark-outline" size={28} color={colors.violet[400]} />
        <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>
          Change your password for the {email ?? 'account'} account.
        </AppText>
      </View>

      <View style={styles.form}>
        <AppInput label="Current password" value={current} onChangeText={setCurrent} secure placeholder="••••••••" />
        <AppInput label="New password" value={next} onChangeText={setNext} secure placeholder="At least 8 characters" />
        <AppInput label="Confirm new password" value={confirm} onChangeText={setConfirm} secure placeholder="Repeat new password" />
      </View>

      <GradientButton title="Update Password" onPress={submit} loading={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.10)',
    marginBottom: 20,
  },
  form: {
    gap: 14,
    marginBottom: 24,
  },
});
