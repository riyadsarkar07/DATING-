import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { AppInput } from '../../components/ui/AppInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { AppModal } from '../../components/ui/AppModal';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { userService } from '../../services/user.service';
import { reauthenticate, deleteFirebaseUser } from '../../firebase/auth';
import { colors } from '../../constants/theme';

export function DeleteAccountScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const logout = useAuthStore((s) => s.logout);
  const showToast = useAppStore((s) => s.showToast);
  const [password, setPassword] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const verify = () => {
    if (!password) {
      showToast('Enter your password to continue', 'error');
      return;
    }
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!uid) return;
    setBusy(true);
    try {
      await reauthenticate(password);
      await userService.deleteAccount(uid);
      await deleteFirebaseUser();
      await logout();
      showToast('Your account has been deleted', 'info');
    } catch {
      showToast('Verification failed. Check your password.', 'error');
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Screen headerTitle="Delete Account" onBack={navigation.goBack} scroll>
      <View style={styles.warn}>
        <Ionicons name="warning" size={34} color={colors.red} />
        <AppText variant="body" color={colors.textSecondary} style={{ lineHeight: 21 }}>
          This action is permanent. Your profile, matches, messages and coins will be deleted and cannot be recovered.
        </AppText>
      </View>

      <View style={styles.form}>
        <AppInput
          label="Enter your password"
          value={password}
          onChangeText={setPassword}
          secure
          placeholder="Confirm it is you"
        />
      </View>

      <GradientButton title="Continue" variant="danger" onPress={verify} />

      <AppModal visible={confirmOpen} onClose={() => setConfirmOpen(false)} heightRatio={0.32}>
        <View style={styles.modalBody}>
          <AppText variant="subheading" color={colors.red}>Delete account?</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            This cannot be undone.
          </AppText>
          <GradientButton title="Yes, delete my account" variant="danger" loading={busy} onPress={doDelete} />
          <GradientButton title="Cancel" variant="ghost" disabled={busy} onPress={() => setConfirmOpen(false)} />
        </View>
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  warn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(239,68,68,0.10)',
    marginBottom: 20,
  },
  form: {
    marginBottom: 24,
  },
  modalBody: {
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
});
