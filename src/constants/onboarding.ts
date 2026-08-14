export interface OnboardingSlide {
  key: string;
  title: string;
  subtitle: string;
  accent: [string, string];
  illustration: 'spark' | 'match' | 'privacy';
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    key: 'spark',
    title: 'Swipe Your Spark',
    subtitle:
      'Meet people who match your vibe. A simple swipe is all it takes to find a meaningful connection.',
    accent: ['#FF3EA5', '#8A4FFF'],
    illustration: 'spark',
  },
  {
    key: 'match',
    title: 'Real Connections',
    subtitle:
      'When you both like each other, it\'s a match. Chat, call and build something beautiful together.',
    accent: ['#7C4DFF', '#00D1FF'],
    illustration: 'match',
  },
  {
    key: 'privacy',
    title: 'Safe & Private',
    subtitle:
      'Your safety comes first. Verified profiles, strict privacy controls and powerful moderation keep SparkX secure.',
    accent: ['#00D1FF', '#7C4DFF'],
    illustration: 'privacy',
  },
];

export const ONBOARDING_STORAGE_KEY = 'sparkx.onboarding.completed.v1';
