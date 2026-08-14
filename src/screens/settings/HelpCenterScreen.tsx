import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { useAuthStore } from '../../store/auth.store';
import { supportService } from '../../services/support.service';
import { useAppStore } from '../../store/app.store';
import { colors } from '../../constants/theme';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I get verified?',
    a: 'Open Profile > Verification and upload a selfie plus your government ID. Our team typically reviews requests within 24 hours.',
  },
  {
    q: 'How do coins work?',
    a: 'Coins are used for Super Likes, Rewinds and Boosts. You can earn free coins daily from Daily Reward or buy packs from the Coins screen.',
  },
  {
    q: 'What does Premium include?',
    a: 'Premium unlocks unlimited likes, rewind, boost perks, seeing who liked you and advanced filters. Check the Premium screen for plan details.',
  },
  {
    q: 'How do I block or report someone?',
    a: 'Open their profile and tap the flag icon in the top-right to report. Reports are reviewed by our safety team.',
  },
  {
    q: 'Why am I not getting matches?',
    a: 'Complete your profile to 100%, add quality photos and try a Boost to increase your visibility.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings > Delete account. Your data will be permanently removed after a short grace period.',
  },
];

export function HelpCenterScreen({ navigation }: any) {
  const showToast = useAppStore((s) => s.showToast);
  const uid = useAuthStore((s) => s.uid);
  const [open, setOpen] = React.useState<number | null>(null);

  const contact = async () => {
    if (!uid) return;
    try {
      await supportService.create(uid, {
        subject: 'Help request',
        message: 'I need help with the app.',
        category: 'general',
      });
      showToast('Support ticket created', 'success');
      navigation.navigate('ContactSupport');
    } catch {
      showToast('Could not create ticket', 'error');
    }
  };

  return (
    <Screen headerTitle="Help Center" onBack={navigation.goBack} scroll>
      <View style={styles.faqs}>
        {FAQS.map((faq, i) => (
          <Pressable
            key={faq.q}
            style={styles.faq}
            onPress={() => setOpen(open === i ? null : i)}
          >
            <View style={styles.faqHeader}>
              <AppText variant="body" style={{ flex: 1 }}>
                {faq.q}
              </AppText>
              <Ionicons
                name={open === i ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </View>
            {open === i ? (
              <AppText variant="caption" color={colors.textSecondary} style={styles.answer}>
                {faq.a}
              </AppText>
            ) : null}
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.contact} onPress={contact}>
        <Ionicons name="headset-outline" size={20} color={colors.violet[400]} />
        <AppText variant="body" color={colors.violet[400]}>
          Still need help? Contact us
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  faqs: { gap: 10 },
  faq: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  answer: { marginTop: 8, lineHeight: 18 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
});
