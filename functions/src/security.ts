import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getAuth } from './guards';

const db = admin.firestore();
const TS = admin.firestore.FieldValue.serverTimestamp;
const INC = admin.firestore.FieldValue.increment;

// ---------------------------------------------------------------------------
// Server-owned catalogs. Clients must never grant themselves coins, premium or
// boosts directly; every privileged mutation goes through these callables.
// ---------------------------------------------------------------------------

const PREMIUM_TIERS = ['gold', 'platinum', 'diamond'] as const;
const PREMIUM_DURATIONS_MONTHS = [1, 3] as const;
const DAY_MS = 24 * 3600 * 1000;
const MONTH_MS = 30 * DAY_MS;

const COIN_PACKS: Record<string, { coins: number; bonus: number }> = {
  starter: { coins: 100, bonus: 0 },
  frequent: { coins: 600, bonus: 100 },
  player: { coins: 1500, bonus: 400 },
  highroller: { coins: 4000, bonus: 1500 },
};

const BOOST_COST_BY_HOURS: Record<number, number> = { 1: 50, 3: 120, 12: 300 };

const DAILY_REWARD_STREAKS = [5, 8, 12, 16, 20, 30, 50];

const LUCKY_SPIN_COST = 10;
const LUCKY_SPIN_PRIZES: { id: string; label: string; coins: number; chance: number }[] = [
  { id: 'c1', label: '5 coins', coins: 5, chance: 0.3 },
  { id: 'c2', label: '10 coins', coins: 10, chance: 0.25 },
  { id: 'c3', label: '20 coins', coins: 20, chance: 0.2 },
  { id: 'c4', label: '50 coins', coins: 50, chance: 0.13 },
  { id: 'c5', label: '100 coins', coins: 100, chance: 0.08 },
  { id: 'c6', label: '500 coins', coins: 500, chance: 0.04 },
];

const TIER_FEATURES: Record<string, Record<string, boolean>> = {
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

const DEFAULT_ENTITLEMENTS: Record<string, boolean> = {
  seeWhoLikedMe: false,
  readReceipts: false,
  incognitoMode: false,
  unlimitedLikes: false,
  unlimitedSwipes: false,
  unlimitedSuperLikes: false,
  boost: false,
  verifiedBadge: false,
};

function toMillis(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'object' && v && typeof (v as any).toMillis === 'function') {
    return (v as any).toMillis();
  }
  return typeof v === 'number' ? v : 0;
}

function isToday(ms: number): boolean {
  const d = new Date(ms);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

function pickWeighted(): { id: string; label: string; coins: number } {
  const total = LUCKY_SPIN_PRIZES.reduce((s, p) => s + p.chance, 0);
  let r = Math.random() * total;
  for (const p of LUCKY_SPIN_PRIZES) {
    r -= p.chance;
    if (r <= 0) return { id: p.id, label: p.label, coins: p.coins };
  }
  const last = LUCKY_SPIN_PRIZES[LUCKY_SPIN_PRIZES.length - 1];
  return { id: last.id, label: last.label, coins: last.coins };
}

async function addCoinTransaction(userId: string, amount: number, type: 'earn' | 'spend', reason: string): Promise<void> {
  await db.collection('coin_transactions').add({
    userId,
    amount,
    type,
    reason,
    createdAt: TS(),
  });
}

// ---------------------------------------------------------------------------
// Premium
// ---------------------------------------------------------------------------

interface GrantPremiumData {
  tier?: string;
  periodMonths?: number;
}

/** Server-side premium purchase. Validates the plan against the catalog. */
export const grantPremium = onCall(async (request: CallableRequest<GrantPremiumData>): Promise<{ ok: boolean; expiresAt: number }> => {
  const ctx = getAuth(request);
  const tier = request.data?.tier;
  const periodMonths = request.data?.periodMonths;
  if (!tier || !PREMIUM_TIERS.includes(tier as any)) {
    throw new HttpsError('invalid-argument', 'Invalid premium tier.');
  }
  if (!periodMonths || !PREMIUM_DURATIONS_MONTHS.includes(periodMonths as any)) {
    throw new HttpsError('invalid-argument', 'Invalid premium duration.');
  }

  const now = Date.now();
  const premiumRef = db.collection('premium').doc(ctx.uid);
  const premiumSnap = await premiumRef.get();
  const currentExpiry = toMillis(premiumSnap.data()?.expiresAt);
  const base = currentExpiry > now ? currentExpiry : now;
  const expiresAt = base + periodMonths * MONTH_MS;

  await premiumRef.set(
    {
      tier,
      expiresAt: new Date(expiresAt),
      autoRenew: false,
      purchasedAt: TS(),
      features: { ...DEFAULT_ENTITLEMENTS, ...TIER_FEATURES[tier] },
    },
    { merge: true },
  );
  await db.collection('users').doc(ctx.uid).set(
    {
      premium: true,
      premiumTier: tier,
      premiumSince: TS(),
      updatedAt: TS(),
    },
    { merge: true },
  );
  return { ok: true, expiresAt };
});

// ---------------------------------------------------------------------------
// Coins
// ---------------------------------------------------------------------------

interface BuyCoinPackData {
  packId?: string;
}

/** Server-side coin pack purchase. */
export const buyCoinPack = onCall(async (request: CallableRequest<BuyCoinPackData>): Promise<{ ok: boolean; coins: number }> => {
  const ctx = getAuth(request);
  const packId = request.data?.packId;
  const pack = packId ? COIN_PACKS[packId] : undefined;
  if (!pack) {
    throw new HttpsError('invalid-argument', 'Unknown coin pack.');
  }
  const coins = pack.coins + pack.bonus;
  await db.collection('coins').doc(ctx.uid).set(
    { balance: INC(coins), totalEarned: INC(coins) },
    { merge: true },
  );
  await addCoinTransaction(ctx.uid, coins, 'earn', `Coin pack · ${pack.coins}${pack.bonus ? ` + ${pack.bonus} bonus` : ''}`);
  return { ok: true, coins };
});

interface ClaimDailyRewardData {
  // no input
}

/** Server-side daily reward claim (streak aware). */
export const claimDailyReward = onCall(async (request: CallableRequest<ClaimDailyRewardData>): Promise<{ coins: number; streak: number; alreadyClaimed: boolean }> => {
  const ctx = getAuth(request);
  const coinRef = db.collection('coins').doc(ctx.uid);
  const snap = await coinRef.get();
  const data = snap.data() ?? {};
  const lastDailyClaimAt = toMillis(data.lastDailyClaimAt);
  const currentStreak = data.streak ?? 0;

  if (lastDailyClaimAt && isToday(lastDailyClaimAt)) {
    return { coins: 0, streak: currentStreak, alreadyClaimed: true };
  }

  const missed = lastDailyClaimAt && Date.now() - lastDailyClaimAt > DAY_MS;
  const streak = missed || !lastDailyClaimAt ? 1 : currentStreak + 1;
  const coins = DAILY_REWARD_STREAKS[(streak - 1) % DAILY_REWARD_STREAKS.length];

  await coinRef.set(
    {
      balance: INC(coins),
      totalEarned: INC(coins),
      lastDailyClaimAt: TS(),
      streak,
    },
    { merge: true },
  );
  await addCoinTransaction(ctx.uid, coins, 'earn', `Daily reward · day ${streak}`);
  return { coins, streak, alreadyClaimed: false };
});

interface SpinLuckyWheelData {
  // no input
}

/** Server-side lucky spin: debits the spin cost and grants a weighted prize atomically. */
export const spinLuckyWheel = onCall(async (request: CallableRequest<SpinLuckyWheelData>): Promise<{ ok: boolean; prize?: { id: string; label: string; coins: number }; balance?: number }> => {
  const ctx = getAuth(request);
  const coinRef = db.collection('coins').doc(ctx.uid);

  let prize: { id: string; label: string; coins: number } | null = null;
  let balance = 0;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(coinRef);
    const current = (snap.data()?.balance ?? 0) as number;
    if (current < LUCKY_SPIN_COST) return;
    prize = pickWeighted();
    balance = current - LUCKY_SPIN_COST + prize.coins;
    tx.update(coinRef, {
      balance: INC(-LUCKY_SPIN_COST + prize.coins),
      totalSpent: INC(LUCKY_SPIN_COST),
      totalEarned: INC(prize.coins),
    });
    tx.set(db.collection('coin_transactions').doc(), {
      userId: ctx.uid,
      amount: -LUCKY_SPIN_COST,
      type: 'spend',
      reason: 'Lucky spin',
      createdAt: TS(),
    });
    tx.set(db.collection('coin_transactions').doc(), {
      userId: ctx.uid,
      amount: prize.coins,
      type: 'earn',
      reason: `Lucky spin · ${prize.label}`,
      createdAt: TS(),
    });
  });

  if (!prize) return { ok: false, balance };
  return { ok: true, prize, balance };
});

interface DebitCoinsData {
  amount?: number;
  reason?: string;
}

/** Server-side coin debit for premium actions (e.g. Super Likes). */
export const debitCoins = onCall(async (request: CallableRequest<DebitCoinsData>): Promise<{ ok: boolean }> => {
  const ctx = getAuth(request);
  const amount = request.data?.amount;
  if (!Number.isInteger(amount) || (amount ?? 0) <= 0 || (amount ?? 0) > 10000) {
    throw new HttpsError('invalid-argument', 'Invalid coin amount.');
  }
  const reason = (request.data?.reason ?? 'Coins').toString().slice(0, 100);
  const coinRef = db.collection('coins').doc(ctx.uid);

  let ok = false;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(coinRef);
    const balance = (snap.data()?.balance ?? 0) as number;
    if (balance < amount!) return;
    tx.update(coinRef, {
      balance: INC(-amount!),
      totalSpent: INC(amount!),
    });
    tx.set(db.collection('coin_transactions').doc(), {
      userId: ctx.uid,
      amount: -amount!,
      type: 'spend',
      reason,
      createdAt: TS(),
    });
    ok = true;
  });
  return { ok };
});

// ---------------------------------------------------------------------------
// Boost
// ---------------------------------------------------------------------------

interface ActivateBoostData {
  hours?: number;
}

/** Server-side boost activation: debits coins and sets boost + boostUntil. */
export const activateBoost = onCall(async (request: CallableRequest<ActivateBoostData>): Promise<{ ok: boolean; expiresAt: number }> => {
  const ctx = getAuth(request);
  const hours = request.data?.hours;
  if (!hours || !BOOST_COST_BY_HOURS[hours]) {
    throw new HttpsError('invalid-argument', 'Invalid boost duration.');
  }
  const cost = BOOST_COST_BY_HOURS[hours];

  const coinRef = db.collection('coins').doc(ctx.uid);
  let ok = false;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(coinRef);
    const balance = (snap.data()?.balance ?? 0) as number;
    if (balance < cost) return;
    tx.update(coinRef, { balance: INC(-cost), totalSpent: INC(cost) });
    ok = true;
  });
  if (!ok) return { ok: false, expiresAt: 0 };

  const boostRef = db.collection('boosts').doc(ctx.uid);
  const boostSnap = await boostRef.get();
  const now = Date.now();
  const currentExpiry = toMillis(boostSnap.data()?.expiresAt);
  const base = currentExpiry > now ? currentExpiry : now;
  const expiresAt = base + hours * 3600 * 1000;

  await boostRef.set({ expiresAt: new Date(expiresAt) }, { merge: true });
  await db.collection('users').doc(ctx.uid).update({
    boostUntil: new Date(expiresAt),
    updatedAt: TS(),
  });
  return { ok: true, expiresAt };
});

// ---------------------------------------------------------------------------
// Block / unblock / delete
// ---------------------------------------------------------------------------

interface BlockUserData {
  targetUid?: string;
}

/** Server-side block: updates the user's public blocked list and the target's private blockedBy list. */
export const blockUser = onCall(async (request: CallableRequest<BlockUserData>): Promise<{ ok: boolean }> => {
  const ctx = getAuth(request);
  const targetUid = request.data?.targetUid;
  if (!targetUid || targetUid === ctx.uid) {
    throw new HttpsError('invalid-argument', 'Invalid target user.');
  }

  const batch = db.batch();
  batch.update(db.collection('users').doc(ctx.uid), {
    blockedUsers: admin.firestore.FieldValue.arrayUnion(targetUid),
    updatedAt: TS(),
  });
  // set-with-merge so the write never fails if the target's private doc is missing
  batch.set(
    db.collection('users').doc(targetUid).collection('private').doc('profile'),
    { blockedBy: admin.firestore.FieldValue.arrayUnion(ctx.uid) },
    { merge: true },
  );

  const matchSnap = await db
    .collection('matches')
    .where('userIds', 'array-contains', ctx.uid)
    .get();
  matchSnap.forEach((d) => {
    const userIds = (d.data()?.userIds ?? []) as string[];
    if (userIds.includes(targetUid)) {
      batch.update(d.ref, { status: 'blocked', updatedAt: TS() });
    }
  });

  await batch.commit();
  return { ok: true };
});

/** Server-side unblock: reverses the block for both parties. */
export const unblockUser = onCall(async (request: CallableRequest<BlockUserData>): Promise<{ ok: boolean }> => {
  const ctx = getAuth(request);
  const targetUid = request.data?.targetUid;
  if (!targetUid) {
    throw new HttpsError('invalid-argument', 'targetUid is required.');
  }
  const batch = db.batch();
  batch.update(db.collection('users').doc(ctx.uid), {
    blockedUsers: admin.firestore.FieldValue.arrayRemove(targetUid),
    updatedAt: TS(),
  });
  // set-with-merge so the write never fails if the target's private doc is missing
  batch.set(
    db.collection('users').doc(targetUid).collection('private').doc('profile'),
    { blockedBy: admin.firestore.FieldValue.arrayRemove(ctx.uid) },
    { merge: true },
  );
  await batch.commit();
  return { ok: true };
});

/**
 * Server-side account deletion. Marks the public doc as deleted, removes all
 * PII from the private doc, and stamps the settings doc. The client then
 * deletes the Firebase Auth account.
 */
export const deleteAccount = onCall(async (request: CallableRequest): Promise<{ ok: boolean }> => {
  const ctx = getAuth(request);
  const uid = ctx.uid;
  const batch = db.batch();

  batch.update(db.collection('users').doc(uid), {
    deleted: true,
    online: false,
    photos: [],
    photoMeta: [],
    blockedUsers: [],
    deletedAt: TS(),
    updatedAt: TS(),
  });
  batch.delete(db.collection('users').doc(uid).collection('private').doc('profile'));
  batch.set(db.collection('settings').doc(uid), { deletedAt: TS() }, { merge: true });

  await batch.commit();
  return { ok: true };
});

/**
 * Mirrors a coarse (~1 decimal place, ~11 km) copy of a user's precise
 * location from the private doc onto the public users doc. Clients can never
 * write `location` on the public doc (rules deny it), so this is the only
 * path that keeps distance-based discovery working without exposing precise
 * coordinates.
 */
export const onPrivateProfileWrite = onDocumentWritten('users/{uid}/private/profile', async (event) => {
  const after = event.data?.after?.data() ?? {};
  const before = event.data?.before?.data() ?? {};
  const loc = after.location as { latitude?: number; longitude?: number } | null | undefined;
  if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return;
  const prev = before.location as { latitude?: number; longitude?: number } | null | undefined;
  if (prev && prev.latitude === loc.latitude && prev.longitude === loc.longitude) return;

  await db.collection('users').doc(event.params.uid).set(
    {
      location: {
        latitude: Math.round(loc.latitude * 10) / 10,
        longitude: Math.round(loc.longitude * 10) / 10,
      },
      updatedAt: TS(),
    },
    { merge: true },
  );
});
