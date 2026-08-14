import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { getAuth } from './guards';

const db = admin.firestore();
const TS = admin.firestore.FieldValue.serverTimestamp;

const SUPER_LIKE_COST = 2;

function toMillis(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'object' && v && typeof (v as any).toMillis === 'function') {
    return (v as any).toMillis();
  }
  return typeof v === 'number' ? v : 0;
}

/**
 * Server-side swipe recording.
 *
 * Clients can never write swipes or matches directly (Firestore rules deny
 * creates on both collections). This callable:
 *   - validates the target user exists, completed setup and hasn't banned us
 *   - debits coins for Super Likes (unless premium covers it)
 *   - writes the swipe
 *   - checks for a mutual like and creates the match server-side
 *
 * This prevents: fake match creation, self-granted coins for Super Likes, and
 * spoofed swipe records.
 */
export const recordSwipe = onCall(async (request: CallableRequest<{ targetUid?: string; direction?: 'like' | 'super_like' | 'pass' }>) => {
  const ctx = getAuth(request);
  const uid = ctx.uid;
  const targetUid = request.data?.targetUid;
  const direction = request.data?.direction;

  if (!targetUid || targetUid === uid) {
    throw new HttpsError('invalid-argument', 'Invalid target user.');
  }
  if (!direction || !['like', 'super_like', 'pass'].includes(direction)) {
    throw new HttpsError('invalid-argument', 'Invalid swipe direction.');
  }

  const targetSnap = await db.collection('users').doc(targetUid).get();
  const target = targetSnap.data();
  if (!targetSnap.exists || target?.deleted || !target?.setupComplete) {
    throw new HttpsError('not-found', 'User not found.');
  }

  const targetPrivateRef = db.collection('users').doc(targetUid).collection('private').doc('profile');
  const targetPrivateSnap = await targetPrivateRef.get();
  const targetPrivate = targetPrivateSnap.data() ?? {};
  if (targetPrivate.banned === true) {
    throw new HttpsError('permission-denied', 'User unavailable.');
  }
  if ((targetPrivate.blockedBy ?? []).includes(uid)) {
    throw new HttpsError('permission-denied', 'User unavailable.');
  }

  if (direction === 'super_like') {
    const premiumSnap = await db.collection('premium').doc(uid).get();
    const premium = premiumSnap.data() ?? {};
    const premiumActive = !!premium.tier && toMillis(premium.expiresAt) > Date.now();
    const unlimitedSuperLikes = premiumActive && premium.features?.unlimitedSuperLikes === true;

    if (!unlimitedSuperLikes) {
      const coinRef = db.collection('coins').doc(uid);
      const paid = await db.runTransaction(async (tx) => {
        const snap = await tx.get(coinRef);
        const balance = (snap.data()?.balance ?? 0) as number;
        if (balance < SUPER_LIKE_COST) return false;
        tx.update(coinRef, {
          balance: admin.firestore.FieldValue.increment(-SUPER_LIKE_COST),
          totalSpent: admin.firestore.FieldValue.increment(SUPER_LIKE_COST),
        });
        tx.set(db.collection('coin_transactions').doc(), {
          userId: uid,
          amount: -SUPER_LIKE_COST,
          type: 'spend',
          reason: 'Super Like',
          createdAt: TS(),
        });
        return true;
      });
      if (!paid) {
        throw new HttpsError('failed-precondition', 'Not enough coins. Get more coins for Super Likes.');
      }
    }
  }

  await db.collection('swipes').add({
    userId: uid,
    targetUid,
    direction,
    createdAt: TS(),
  });

  let matched = false;
  let matchId: string | undefined;
  if (direction === 'like' || direction === 'super_like') {
    const mutual = await db
      .collection('swipes')
      .where('userId', '==', targetUid)
      .where('targetUid', '==', uid)
      .where('direction', 'in', ['like', 'super_like'])
      .limit(1)
      .get();
    if (!mutual.empty) {
      const created = await createMatch(uid, targetUid);
      if (created) {
        matched = true;
        matchId = created;
      }
    }
  }

  return { ok: true, matched, matchId };
});

/**
 * Creates a match + the "You matched!" system message atomically, guarded
 * against duplicates. Only called from recordSwipe after a verified mutual
 * like — clients cannot invoke it.
 */
async function createMatch(uidA: string, uidB: string): Promise<string | null> {
  const existing = await db
    .collection('matches')
    .where('userIds', 'array-contains', uidA)
    .limit(50)
    .get();
  for (const d of existing.docs) {
    const userIds = (d.data()?.userIds ?? []) as string[];
    if (userIds.length === 2 && userIds.includes(uidB)) {
      return null;
    }
  }

  const matchRef = db.collection('matches').doc();
  const systemMsgRef = db.collection('messages').doc();

  await db.runTransaction(async (tx) => {
    tx.set(matchRef, {
      userIds: [uidA, uidB],
      status: 'active',
      matchedAt: TS(),
      lastMessageAt: TS(),
      lastMessagePreview: 'You matched! Say hi 👋',
      lastMessageKind: 'system',
      lastMessageSenderId: '',
      isArchived: false,
      isPinned: false,
      isMuted: false,
      participants: {
        [uidA]: { lastReadAt: 0, unseenCount: 0 },
        [uidB]: { lastReadAt: 0, unseenCount: 0 },
      },
    });
    tx.set(systemMsgRef, {
      matchId: matchRef.id,
      senderId: 'system',
      kind: 'system',
      text: 'You matched! Start the conversation.',
      createdAt: TS(),
      readAt: null,
      deliveredAt: null,
      deleted: false,
    });
  });

  return matchRef.id;
}
