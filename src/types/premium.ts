import { PremiumTier } from './enums';

export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  createdAt: number;
}

export interface CoinBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastDailyClaimAt: number | null;
  streak: number;
}

export interface PremiumPlan {
  id: string;
  tier: PremiumTier;
  title: string;
  subtitle: string;
  price: number;
  oldPrice: number;
  periodMonths: number;
  badge: string;
  features: string[];
  accent: [string, string];
}

export interface PremiumEntitlements {
  seeWhoLikedMe: boolean;
  readReceipts: boolean;
  incognitoMode: boolean;
  unlimitedLikes: boolean;
  unlimitedSwipes: boolean;
  unlimitedSuperLikes: boolean;
  boost: boolean;
  verifiedBadge: boolean;
}

export interface PremiumState {
  tier: PremiumTier | null;
  expiresAt: number | null;
  entitlements: PremiumEntitlements;
}

export interface DailyRewardState {
  lastClaimAt: number | null;
  streak: number;
}

export interface LuckySpinPrize {
  id: string;
  label: string;
  coins: number;
  chance: number;
  color: string;
}

export interface BoostState {
  expiresAt: number | null;
  active: boolean;
}
