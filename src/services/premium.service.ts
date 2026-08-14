import db, { COLLECTIONS } from '../firebase/firestore';
import { PremiumEntitlements, PremiumState, BoostState } from '../types/premium';
import { PremiumTier } from '../types/enums';
import { callFunction } from '../firebase/functions';

const DEFAULT_ENTITLEMENTS: PremiumEntitlements = {
  seeWhoLikedMe: false,
  readReceipts: false,
  incognitoMode: false,
  unlimitedLikes: false,
  unlimitedSwipes: false,
  unlimitedSuperLikes: false,
  boost: false,
  verifiedBadge: false,
};

const TIER_FEATURES: Record<PremiumTier, Partial<PremiumEntitlements>> = {
  gold: {
    seeWhoLikedMe: true,
    readReceipts: true,
    unlimitedLikes: true,
    unlimitedSwipes: false,
    unlimitedSuperLikes: false,
    boost: true,
    verifiedBadge: false,
    incognitoMode: false,
  },
  platinum: {
    seeWhoLikedMe: true,
    readReceipts: true,
    unlimitedLikes: true,
    unlimitedSwipes: true,
    unlimitedSuperLikes: true,
    boost: true,
    verifiedBadge: false,
    incognitoMode: true,
  },
  diamond: {
    seeWhoLikedMe: true,
    readReceipts: true,
    unlimitedLikes: true,
    unlimitedSwipes: true,
    unlimitedSuperLikes: true,
    boost: true,
    verifiedBadge: true,
    incognitoMode: true,
  },
};

class PremiumService {
  watchState(uid: string, cb: (state: PremiumState) => void): () => void {
    return db.collection(COLLECTIONS.premium).doc(uid).onSnapshot((doc) => {
      cb(this.mapState(doc.exists ? doc.data() as any : null));
    });
  }

  watchBoost(uid: string, cb: (state: BoostState) => void): () => void {
    return db.collection(COLLECTIONS.boosts).doc(uid).onSnapshot((doc) => {
      const data = doc.exists ? doc.data() as any : null;
      const expiresAt = data?.expiresAt ? toMillis(data.expiresAt) : null;
      cb({ expiresAt, active: !!expiresAt && expiresAt > Date.now() });
    });
  }

  async getState(uid: string): Promise<PremiumState> {
    const doc = await db.collection(COLLECTIONS.premium).doc(uid).get();
    return this.mapState(doc.exists ? doc.data() as any : null);
  }

  async getEntitlements(uid: string): Promise<PremiumEntitlements> {
    const doc = await db.collection(COLLECTIONS.premium).doc(uid).get();
    return this.mapState(doc.exists ? doc.data() as any : null).entitlements;
  }

  /** Server-side premium purchase (validated against the plan catalog). */
  async purchase(uid: string, tier: PremiumTier, periodMonths: number, price: number): Promise<void> {
    await callFunction('grantPremium', { tier, periodMonths });
  }

  /** Server-side boost activation: debits coins and sets the boost expiry. */
  async activateBoost(uid: string, hours: number, costCoins: number): Promise<boolean> {
    const res = await callFunction<{ ok: boolean; expiresAt: number }>('activateBoost', { hours });
    return res.ok;
  }

  mapState(data: any): PremiumState {
    const tier: PremiumTier | null = data?.tier ?? null;
    const expiresAt = data?.expiresAt ? toMillis(data.expiresAt) : null;
    const active = !!tier && !!expiresAt && expiresAt > Date.now();
    const features = active
      ? { ...DEFAULT_ENTITLEMENTS, ...(data?.features ?? TIER_FEATURES[tier as PremiumTier] ?? {}) }
      : DEFAULT_ENTITLEMENTS;
    return {
      tier: active ? tier : null,
      expiresAt: active ? expiresAt : null,
      entitlements: features,
    };
  }
}

function toMillis(v: any): number {
  if (!v) return 0;
  if (v.toMillis) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

export const premiumService = new PremiumService();
