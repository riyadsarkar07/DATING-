import { PremiumPlan, LuckySpinPrize } from '../types/premium';

export const premiumPlans: PremiumPlan[] = [
  {
    id: 'gold_1m',
    tier: 'gold',
    title: 'SparkX Gold',
    subtitle: 'Boost your profile',
    price: 19.99,
    oldPrice: 29.99,
    periodMonths: 1,
    badge: 'Most Popular',
    features: [
      '50 Super Likes per week',
      '5 Boosts per month',
      'Unlimited Likes',
      'See who liked you',
      'Read receipts',
      'No ads',
    ],
    accent: ['#FFC53D', '#F5A623'],
  },
  {
    id: 'platinum_1m',
    tier: 'platinum',
    title: 'SparkX Platinum',
    subtitle: 'All of Gold, plus more',
    price: 29.99,
    oldPrice: 44.99,
    periodMonths: 1,
    badge: 'Best Value',
    features: [
      '100 Super Likes per week',
      'Unlimited Boosts',
      'Incognito mode',
      'Unlimited Rewinds',
      'Daily priority likes',
      'All Gold features',
    ],
    accent: ['#FF3EA5', '#8A4FFF'],
  },
  {
    id: 'diamond_3m',
    tier: 'diamond',
    title: 'SparkX Diamond',
    subtitle: 'The ultimate experience',
    price: 49.99,
    oldPrice: 79.99,
    periodMonths: 3,
    badge: 'Luxury',
    features: [
      'Unlimited Super Likes',
      'Verified badge',
      'Priority visibility 24/7',
      'See everyone who visited',
      'Advanced AI matches',
      'All Platinum features',
    ],
    accent: ['#00D1FF', '#7C4DFF'],
  },
];

export const coinPacks: { id: string; coins: number; price: number; bonus?: number }[] = [
  { id: 'starter', coins: 100, price: 1.99 },
  { id: 'frequent', coins: 600, price: 9.99, bonus: 100 },
  { id: 'player', coins: 1500, price: 19.99, bonus: 400 },
  { id: 'highroller', coins: 4000, price: 44.99, bonus: 1500 },
];

export const boostPrices: { id: string; label: string; coins: number; hours: number }[] = [
  { id: 'boost_1h', label: '1 Hour', coins: 50, hours: 1 },
  { id: 'boost_3h', label: '3 Hours', coins: 120, hours: 3 },
  { id: 'boost_12h', label: '12 Hours', coins: 300, hours: 12 },
];

export const dailyRewardStreaks: { day: number; coins: number }[] = [
  { day: 1, coins: 5 },
  { day: 2, coins: 8 },
  { day: 3, coins: 12 },
  { day: 4, coins: 16 },
  { day: 5, coins: 20 },
  { day: 6, coins: 30 },
  { day: 7, coins: 50 },
];

export const luckySpinPrizes: LuckySpinPrize[] = [
  { id: 'c1', label: '5 coins', coins: 5, chance: 0.3, color: '#24243A' },
  { id: 'c2', label: '10 coins', coins: 10, chance: 0.25, color: '#1A1A2E' },
  { id: 'c3', label: '20 coins', coins: 20, chance: 0.2, color: '#5325C4' },
  { id: 'c4', label: '50 coins', coins: 50, chance: 0.13, color: '#7C4DFF' },
  { id: 'c5', label: '100 coins', coins: 100, chance: 0.08, color: '#FF3EA5' },
  { id: 'c6', label: '500 coins', coins: 500, chance: 0.04, color: '#F5A623' },
];

export const superLikeCost = 2;
export const rewindCost = 2;
export const boostCostByHours: Record<number, number> = { 1: 50, 3: 120, 12: 300 };
