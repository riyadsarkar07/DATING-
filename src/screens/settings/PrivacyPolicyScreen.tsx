import React from 'react';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/theme';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide such as your name, email, photos, preferences and profile details. We also collect usage data, device information, and approximate location when you enable it.',
  },
  {
    title: '2. How We Use Your Data',
    body: 'Your data is used to provide matching, messaging, and account services; to personalize your experience; and to keep the community safe. We do not sell your personal information.',
  },
  {
    title: '3. Sharing',
    body: 'Your profile is visible to other members as part of the service. We share data with service providers (like Firebase) who help operate the app under strict data agreements.',
  },
  {
    title: '4. Photos & Content',
    body: 'Photos you upload may be processed by automated systems to detect prohibited content. This helps us enforce community guidelines.',
  },
  {
    title: '5. Location',
    body: 'Approximate distance is shown to other members unless you disable it in Privacy settings. Your exact address is never shared.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain your data while your account is active. When you delete your account, your data is removed in line with our retention schedule.',
  },
  {
    title: '7. Your Rights',
    body: 'You can access, correct, or delete your data at any time from within the app. Contact support to exercise any other data rights.',
  },
  {
    title: '8. Contact',
    body: 'For privacy questions, contact us from within the app.',
  },
];

export function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <Screen headerTitle="Privacy Policy" onBack={navigation.goBack} scroll>
      <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: 16 }}>
        Last updated: January 2026
      </AppText>
      {SECTIONS.map((s) => (
        <AppText key={s.title} variant="body" style={styles.text}>
          <AppText variant="body" color={colors.white}>
            {s.title}
            {'\n'}
          </AppText>
          {s.body}
        </AppText>
      ))}
    </Screen>
  );
}

const styles = { text: { marginBottom: 16, lineHeight: 20 } };
