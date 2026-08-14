import React from 'react';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/theme';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using SparkX, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the app.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years old to use SparkX. By using the app you confirm you meet this age requirement and that the information you provide is accurate.',
  },
  {
    title: '3. Conduct',
    body: 'You agree not to harass, threaten, impersonate, or deceive other members. Inappropriate content, spam, fraud, and solicitation are strictly prohibited and may result in account termination.',
  },
  {
    title: '4. Content',
    body: 'You retain ownership of content you upload. You grant SparkX a license to display this content to other members. You must not upload content you do not have rights to.',
  },
  {
    title: '5. Premium & Coins',
    body: 'Premium subscriptions and coin purchases are billed through your app store. Purchases are non-refundable except where required by law. Prices may change with notice.',
  },
  {
    title: '6. Termination',
    body: 'You may delete your account at any time. We may suspend or terminate accounts that violate these terms or harm the community.',
  },
  {
    title: '7. Disclaimers',
    body: 'SparkX provides the service "as is" without warranties. We do not guarantee matches or the conduct of other members. Use the app at your own discretion.',
  },
  {
    title: '8. Contact',
    body: 'For questions about these terms, contact support from within the app.',
  },
];

export function TermsScreen({ navigation }: any) {
  return (
    <Screen headerTitle="Terms of Service" onBack={navigation.goBack} scroll>
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
