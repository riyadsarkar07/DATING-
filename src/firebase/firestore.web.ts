import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export const db = firebase.firestore();

export const COLLECTIONS = {
  users: 'users',
  profiles: 'profiles',
  swipes: 'swipes',
  matches: 'matches',
  messages: 'messages',
  notifications: 'notifications',
  coins: 'coins',
  coinTransactions: 'coin_transactions',
  premium: 'premium',
  verificationRequests: 'verification_requests',
  reports: 'reports',
  support: 'support',
  settings: 'settings',
  calls: 'call_history',
  dailyRewards: 'daily_rewards',
  luckySpins: 'lucky_spins',
  boosts: 'boosts',
} as const;

export type FirestoreTimestamp = ReturnType<typeof firebase.firestore.Timestamp.fromDate>;

export const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();
export const increment = (n: number) => firebase.firestore.FieldValue.increment(n);
export const arrayUnion = (...args: unknown[]) => firebase.firestore.FieldValue.arrayUnion(...args);
export const arrayRemove = (...args: unknown[]) => firebase.firestore.FieldValue.arrayRemove(...args);
export const deleteField = () => firebase.firestore.FieldValue.delete();

export const nowMillis = () => Date.now();

export async function runTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  return db.runTransaction(fn as any);
}

export default db;
