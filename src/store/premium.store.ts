import { create } from 'zustand';
import {
  PremiumState,
  CoinBalance,
  BoostState,
  DailyRewardState,
} from '../types/premium';

interface PremiumStoreState {
  premium: PremiumState;
  coins: CoinBalance;
  boost: BoostState;
  daily: DailyRewardState;
  setPremium: (premium: PremiumState) => void;
  setCoins: (coins: CoinBalance) => void;
  setBoost: (boost: BoostState) => void;
  setDaily: (daily: DailyRewardState) => void;
  resetPremium: () => void;
}

const emptyPremium: PremiumState = {
  tier: null,
  expiresAt: null,
  entitlements: {
    seeWhoLikedMe: false,
    readReceipts: false,
    incognitoMode: false,
    unlimitedLikes: false,
    unlimitedSwipes: false,
    unlimitedSuperLikes: false,
    boost: false,
    verifiedBadge: false,
  },
};

export const usePremiumStore = create<PremiumStoreState>((set) => ({
  premium: emptyPremium,
  coins: { balance: 0, totalEarned: 0, totalSpent: 0, lastDailyClaimAt: null, streak: 0 },
  boost: { expiresAt: null, active: false },
  daily: { lastClaimAt: null, streak: 0 },

  setPremium: (premium) => set({ premium }),
  setCoins: (coins) => set({ coins, daily: { lastClaimAt: coins.lastDailyClaimAt, streak: coins.streak } }),
  setBoost: (boost) => set({ boost }),
  setDaily: (daily) => set({ daily }),

  resetPremium: () =>
    set({ premium: emptyPremium, boost: { expiresAt: null, active: false } }),
}));
