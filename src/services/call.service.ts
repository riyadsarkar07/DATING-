import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';
import { CallRecord } from '../types/chat';
import { CallType } from '../types/enums';
import { logEvent } from '../firebase/analytics';

export interface CallSignal {
  id: string;
  callerId: string;
  calleeId: string;
  matchId: string;
  type: CallType;
  status: 'ringing' | 'answered' | 'declined' | 'ended' | 'missed';
  createdAt: number;
}

const signalRef = (calleeUid: string) =>
  db.collection(COLLECTIONS.users).doc(calleeUid).collection('callSignals');

class CallService {
  async initiate(calleeUid: string, callerUid: string, matchId: string, type: CallType): Promise<string> {
    const ref = await signalRef(calleeUid).add({
      callerId: callerUid,
      calleeId: calleeUid,
      matchId,
      type,
      status: 'ringing',
      createdAt: serverTimestamp(),
    });
    logEvent('call_initiated', { user_id: callerUid, type });
    return ref.id;
  }

  async answer(signalId: string, calleeUid: string): Promise<void> {
    await signalRef(calleeUid).doc(signalId).update({ status: 'answered' });
  }

  async decline(signalId: string, calleeUid: string): Promise<void> {
    await signalRef(calleeUid).doc(signalId).update({ status: 'declined' });
  }

  async end(signalId: string, calleeUid: string, callerUid: string, type: CallType, matchId: string): Promise<void> {
    await signalRef(calleeUid).doc(signalId).update({ status: 'ended' });
    await this.record(callerUid, calleeUid, type, 'ended', matchId, 0, 'callee');
  }

  watchIncoming(uid: string, cb: (signal: CallSignal | null) => void): () => void {
    return db
      .collection(COLLECTIONS.users)
      .doc(uid)
      .collection('callSignals')
      .where('status', '==', 'ringing')
      .limit(1)
      .onSnapshot((snap) => {
        if (snap.empty) return cb(null);
        const d = snap.docs[0];
        cb({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) });
      });
  }

  watchSignal(
    calleeUid: string,
    signalId: string,
    cb: (signal: CallSignal | null) => void,
  ): () => void {
    return db
      .collection(COLLECTIONS.users)
      .doc(calleeUid)
      .collection('callSignals')
      .doc(signalId)
      .onSnapshot((d) => {
        if (!d.exists) return cb(null);
        const data = d.data() as any;
        cb({ id: d.id, ...data, createdAt: toMillis(data.createdAt) });
      });
  }

  /**
   * Records a call. Missed-call notifications are created server-side by the
   * onCallHistoryCreated trigger, using the `notifyTo` field written here.
   */
  async record(
    callerUid: string,
    calleeUid: string,
    type: CallType,
    status: 'missed' | 'ended' | 'ongoing',
    matchId: string | null,
    durationSec: number,
    notifyTo: 'caller' | 'callee' = 'callee',
  ): Promise<void> {
    await db.collection(COLLECTIONS.calls).add({
      callerId: callerUid,
      calleeId: calleeUid,
      matchId: matchId ?? '',
      type,
      status,
      startedAt: serverTimestamp(),
      endedAt: status === 'ended' ? serverTimestamp() : null,
      durationSec,
      notifyTo,
    });
  }

  async updateEnded(callId: string, durationSec: number): Promise<void> {
    await db.collection(COLLECTIONS.calls).doc(callId).update({
      status: 'ended',
      endedAt: serverTimestamp(),
      durationSec,
    });
  }

  watchHistory(uid: string, cb: (records: CallRecord[]) => void): () => void {
    return db
      .collection(COLLECTIONS.calls)
      .where('callerId', '==', uid)
      .orderBy('startedAt', 'desc')
      .limit(50)
      .onSnapshot(
        async (snap1) => {
          const out: CallRecord[] = [];
          snap1.docs.forEach((d) => {
            const data = d.data() as any;
            out.push({
              id: d.id,
              matchId: data.matchId ?? '',
              callerId: data.callerId,
              calleeId: data.calleeId,
              type: data.type,
              status: data.status,
              startedAt: toMillis(data.startedAt),
              endedAt: data.endedAt ? toMillis(data.endedAt) : null,
              durationSec: data.durationSec ?? 0,
            });
          });
          const snap2 = await db
            .collection(COLLECTIONS.calls)
            .where('calleeId', '==', uid)
            .orderBy('startedAt', 'desc')
            .limit(50)
            .get();
          snap2.forEach((d) => {
            const data = d.data() as any;
            out.push({
              id: d.id,
              matchId: data.matchId ?? '',
              callerId: data.callerId,
              calleeId: data.calleeId,
              type: data.type,
              status: data.status,
              startedAt: toMillis(data.startedAt),
              endedAt: data.endedAt ? toMillis(data.endedAt) : null,
              durationSec: data.durationSec ?? 0,
            });
          });
          out.sort((a, b) => b.startedAt - a.startedAt);
          cb(out.slice(0, 50));
        },
        () => cb([]),
      );
  }
}

function toMillis(v: any): number {
  if (!v) return 0;
  if (v.toMillis) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

export const callService = new CallService();
