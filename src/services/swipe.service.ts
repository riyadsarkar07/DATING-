import db, { COLLECTIONS } from '../firebase/firestore';
import { SwipeDirection } from '../types/enums';
import { callFunction } from '../firebase/functions';
import { logEvent } from '../firebase/analytics';
import { errorNotification } from '../core/utils/haptics';

class SwipeService {
  async getSwipedUids(uid: string, directions: SwipeDirection[]): Promise<string[]> {
    try {
      const snap = await db
        .collection(COLLECTIONS.swipes)
        .where('userId', '==', uid)
        .where('direction', 'in', directions)
        .limit(200)
        .get();
      return snap.docs.map((d) => d.data().targetUid);
    } catch {
      return [];
    }
  }

  /**
   * Server-side swipe recording: the Cloud Function debits coins for Super
   * Likes, writes the swipe, verifies a mutual like and creates the match —
   * so clients can never fake a match or grant themselves coins.
   */
  async recordSwipe(
    uid: string,
    targetUid: string,
    direction: SwipeDirection,
  ): Promise<{ matched: boolean; matchId?: string }> {
    try {
      const res = await callFunction<{ ok: boolean; matched: boolean; matchId?: string }>('recordSwipe', {
        targetUid,
        direction,
      });
      logEvent(direction === 'pass' ? 'swipe_pass' : 'swipe_like', {
        user_id: uid,
        target_id: targetUid,
      });
      return { matched: res.matched, matchId: res.matchId };
    } catch (err: any) {
      const message = err?.message ?? '';
      if (message.includes('Not enough coins')) {
        errorNotification();
        throw new Error('Not enough coins. Get more coins for Super Likes.');
      }
      if (message.includes('User unavailable') || message.includes('User not found')) {
        throw new Error(message);
      }
      errorNotification();
      throw new Error('Could not record swipe. Please try again.');
    }
  }
}

export const swipeService = new SwipeService();
