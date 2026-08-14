import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { AppInput } from '../../components/ui/AppInput';
import { GradientButton } from '../../components/ui/GradientButton';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { supportService, SupportTicket } from '../../services/support.service';
import { colors } from '../../constants/theme';

const CATEGORIES = ['General', 'Account', 'Billing', 'Safety', 'Bug report', 'Other'];

export function ContactSupportScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const showToast = useAppStore((s) => s.showToast);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');
  const [busy, setBusy] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (!uid) return;
    let unsub: (() => void) | null = null;
    supportService.watchMine(uid, setTickets).then((fn) => {
      unsub = fn;
    });
    return () => {
      unsub?.();
    };
  }, [uid]);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      showToast('Please fill in subject and message', 'error');
      return;
    }
    if (!uid) return;
    setBusy(true);
    try {
      await supportService.create(uid, { subject: subject.trim(), message: message.trim(), category });
      showToast('Ticket submitted', 'success');
      setSubject('');
      setMessage('');
    } catch {
      showToast('Could not submit ticket', 'error');
    } finally {
      setBusy(false);
    }
  };

  const statusColor = (status: string) =>
    status === 'open' ? colors.blush[500] : status === 'in_progress' ? colors.violet[400] : '#38CFFC';

  return (
    <Screen headerTitle="Contact Support" onBack={navigation.goBack} scroll>
      <AppText variant="caption" color={colors.textSecondary}>
        Describe your issue and our support team will get back to you.
      </AppText>

      <View style={styles.form}>
        <AppInput label="Subject" value={subject} onChangeText={setSubject} placeholder="Brief summary" />
        <View style={styles.categories}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.cat, category === c && styles.catActive]}
              onPress={() => setCategory(c)}
            >
              <AppText variant="caption" color={category === c ? colors.white : colors.textSecondary}>
                {c}
              </AppText>
            </Pressable>
          ))}
        </View>
        <AppInput
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Tell us more..."
          multiline
          style={{ minHeight: 120 }}
        />
        <GradientButton title="Submit Ticket" onPress={submit} loading={busy} />
      </View>

      {tickets.length > 0 ? (
        <View style={styles.history}>
          <AppText variant="subheading">Your tickets</AppText>
          {tickets.map((t) => (
            <Pressable
              key={t.id}
              style={styles.ticket}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: t.id })}
            >
              <View style={styles.ticketHeader}>
                <AppText variant="body" style={{ flex: 1 }}>
                  {t.subject}
                </AppText>
                <AppText variant="caption" color={statusColor(t.status)}>
                  {t.status.replace('_', ' ')}
                </AppText>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
              <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
                {t.message}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 16, gap: 16 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cat: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  catActive: {
    backgroundColor: colors.violet[600],
    borderColor: colors.violet[500],
  },
  history: { marginTop: 28, gap: 10 },
  ticket: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 6,
  },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
