import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';
import { VerificationStatus } from '../types/enums';
import { uploadVerificationFile } from '../firebase/storage';
import { logEvent } from '../firebase/analytics';

export interface VerificationRequest {
  id: string;
  userId: string;
  selfieUrl: string;
  idPhotoUrl: string;
  status: VerificationStatus;
  createdAt: number;
  reviewedAt: number | null;
}

class VerificationService {
  async submit(uid: string, selfieUri: string, idUri: string): Promise<string> {
    const selfieUrl = await uploadVerificationFile(uid, selfieUri, 'selfie');
    const idPhotoUrl = await uploadVerificationFile(uid, idUri, 'id');
    const ref = await db.collection(COLLECTIONS.verificationRequests).add({
      userId: uid,
      selfieUrl,
      idPhotoUrl,
      status: 'pending',
      createdAt: serverTimestamp(),
      reviewedAt: null,
    });
    logEvent('verification_requested', { user_id: uid });
    return ref.id;
  }

  async getLatestStatus(uid: string): Promise<{ status: VerificationStatus; createdAt: number } | null> {
    const snap = await db
      .collection(COLLECTIONS.verificationRequests)
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0].data() as any;
    const createdAt = d.createdAt?.toMillis ? d.createdAt.toMillis() : Date.now();
    return { status: d.status, createdAt };
  }

  async watchStatus(uid: string, cb: (status: VerificationStatus) => void): Promise<() => void> {
    return db
      .collection(COLLECTIONS.verificationRequests)
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .onSnapshot((snap) => {
        if (snap.empty) return;
        cb(snap.docs[0].data().status);
      });
  }
}

export const verificationService = new VerificationService();
