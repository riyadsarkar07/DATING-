import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { requireAdmin } from './guards';

const db = admin.firestore();

interface VerifyData {
  requestId?: string;
  approve?: boolean;
  reason?: string;
}

/**
 * Admin reviews an identity verification request.
 * Approving sets the user's `verified` flag true and marks the request approved.
 */
export const reviewVerification = onCall(async (request: CallableRequest<VerifyData>) => {
  const adminCtx = requireAdmin(request);
  const data = request.data ?? {};
  if (!data.requestId) {
    throw new HttpsError('invalid-argument', 'requestId is required.');
  }

  const reqRef = db.collection('verification_requests').doc(data.requestId);
  const snap = await reqRef.get();
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Verification request not found.');
  }
  const req = snap.data() as { userId?: string; status?: string };

  await reqRef.update({
    status: data.approve ? 'approved' : 'rejected',
    rejectionReason: data.approve ? '' : (data.reason ?? ''),
    reviewedBy: adminCtx.uid,
    reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (req.userId) {
    await db.collection('users').doc(req.userId).set(
      { verified: !!data.approve },
      { merge: true },
    );
  }

  return { ok: true };
});
