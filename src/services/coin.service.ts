import db, { COLLECTIONS } from '../firebase/firestore';
import { CoinBalance, CoinTransaction } from '../types/premium';
import { callFunction } from '../firebase/functions';
import { logEvent } from '../firebase/analytics';

class CoinService {
  watchBalance(uid: string, cb: (balance: CoinBalance) => void): () => void {
    return db.collection(COLLECTIONS.coins).doc(uid).onSnapshot((doc) => {
      cb(this.mapBalance(doc.exists ? doc.data() as any : null));
    });
  }

  async getBalance(uid: string): Promise<CoinBalance> {
    const doc = await db.collection(COLLECTIONS.coins).doc(uid).get();
    return this.mapBalance(doc.exists ? doc.data() as any : null);
  }

  private mapBalance(data: any): CoinBalance {
    return {
      balance: data?.balance ?? 0,
      totalEarned: data?.totalEarned ?? 0,
      totalSpent: data?.totalSpent ?? 0,
      lastDailyClaimAt: data?.lastDailyClaimAt ? toMillis(data.lastDailyClaimAt) : null,
      streak: data?.streak ?? 0,
    };
  }

  /** Server-side coin debit (e.g. Super Likes, rewinds). */
  async spend(uid: string, amount: number, reason: string): Promise<boolean> {
    const res = await callFunction<{ ok: boolean }>('debitCoins', { amount, reason });
    if (res.ok) logEvent('coins_spent', { user_id: uid, amount, reason });
    return res.ok;
  }

  /** Server-side coin pack purchase. */
  async buyPack(packId: string): Promise<boolean> {
    const res = await callFunction<{ ok: boolean; coins: number }>('buyCoinPack', { packId });
    if (res.ok) logEvent('coins_purchased', { pack_id: packId, coins: res.coins });
    return res.ok;
  }

  /** Server-side daily reward claim (streak aware). */
  async claimDailyReward(uid: string): Promise<{ coins: number; streak: number; alreadyClaimed: boolean }> {
    const res = await callFunction<{ coins: number; streak: number; alreadyClaimed: boolean }>('claimDailyReward');
    if (!res.alreadyClaimed) logEvent('daily_reward_claimed', { user_id: uid, coins: res.coins, streak: res.streak });
    return res;
  }

  /**
   * Server-side lucky spin: debits the cost and grants a weighted prize
   * atomically. The prize is chosen server-side so clients cannot grant
   * themselves coins.
   */
  async spinWheel(): Promise<{
    ok: boolean;
    prize?: { id: string; label: string; coins: number };
    balance?: number;
  }> {
    return callFunction<{ ok: boolean; prize?: { id: string; label: string; coins: number }; balance?: number }>('spinLuckyWheel');
  }

  async watchTransactions(uid: string, cb: (items: CoinTransaction[]) => void): Promise<() => void> {
    return db
      .collection(COLLECTIONS.coinTransactions)
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot((snap) => {
        const items: CoinTransaction[] = snap.docs.map((d) => ({
          id: d.id,
          amount: d.data().amount,
          type: d.data().type,
          reason: d.data().reason,
          createdAt: toMillis(d.data().createdAt),
        }));
        cb(items);
      });
  }
}

function toMillis(v: any): number {
  if (!v) return 0;
  if (v.toMillis) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

export const coinService = new CoinService();
