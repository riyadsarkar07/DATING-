import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { requireAdmin } from './guards';

const db = admin.firestore();

const BAN_THRESHOLD = 3;

const privateProfile = (uid: string) => db.collection('users').doc(uid).collection('private').doc('profile');

interface BanData {
  uid?: string;
  reason?: string;
}

/** Bans a user: disables the Auth account and marks the private profile as banned. */
export const banUser = onCall(async (request: CallableRequest<BanData>) => {
  requireAdmin(request);
  const uid = request.data?.uid;
  if (!uid) {
    throw new HttpsError('invalid-argument', 'uid is required.');
  }
  const reason = (request.data?.reason ?? '').slice(0, 500);

  await admin.auth().updateUser(uid, { disabled: true });
  await privateProfile(uid).set(
    {
      banned: true,
      bannedReason: reason,
      bannedAt: admin.firestore.FieldValue.serverTimestamp(),
      bannedBy: request.auth!.uid,
    },
    { merge: true },
  );
  return { ok: true };
});

/** Unbans a user: re-enables the Auth account and clears the banned flags. */
export const unbanUser = onCall(async (request: CallableRequest<BanData>) => {
  requireAdmin(request);
  const uid = request.data?.uid;
  if (!uid) {
    throw new HttpsError('invalid-argument', 'uid is required.');
  }

  await admin.auth().updateUser(uid, { disabled: false });
  const snap = await privateProfile(uid).get();
  if (snap.exists) {
    await privateProfile(uid).update({
      banned: admin.firestore.FieldValue.delete(),
      bannedReason: admin.firestore.FieldValue.delete(),
      bannedAt: admin.firestore.FieldValue.delete(),
    });
  }
  return { ok: true };
});

interface ResolveReportData {
  reportId?: string;
  action?: 'dismiss' | 'warn' | 'ban';
  note?: string;
}

/**
 * Resolves a user report. Admins can dismiss, warn, or ban the target.
 * Bans the target account when action === 'ban'.
 */
export const resolveReport = onCall(async (request: CallableRequest<ResolveReportData>) => {
  const adminCtx = requireAdmin(request);
  const data = request.data ?? {};
  const reportId = data.reportId;
  if (!reportId) {
    throw new HttpsError('invalid-argument', 'reportId is required.');
  }

  const reportRef = db.collection('reports').doc(reportId);
  const report = await reportRef.get();
  if (!report.exists) {
    throw new HttpsError('not-found', 'Report not found.');
  }

  const action = data.action ?? 'dismiss';
  const targetUid = report.data()?.targetUid as string | undefined;

  const update: Record<string, unknown> = {
    status: action === 'ban' ? 'resolved_banned' : 'resolved',
    resolution: action,
    reviewedBy: adminCtx.uid,
    note: data.note ?? '',
    resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await reportRef.update(update);

  if (action === 'ban' && targetUid) {
    await admin.auth().updateUser(targetUid, { disabled: true });
    await privateProfile(targetUid).set(
      {
        banned: true,
        bannedReason: `Banned after report ${reportId}`,
        bannedAt: admin.firestore.FieldValue.serverTimestamp(),
        bannedBy: adminCtx.uid,
      },
      { merge: true },
    );
  }

  return { ok: true };
});

/**
 * Server-side trigger that keeps the reportedCount and status flags accurate
 * without trusting client writes (the old client code wrote these directly,
 * which Firestore rules correctly rejected).
 */
export const onReportCreated = onDocumentCreated('reports/{reportId}', async (event) => {
  const data = event.data?.data();
  const targetUid = data?.targetUid as string | undefined;
  if (!targetUid) return;

  const targetRef = privateProfile(targetUid);
  const snap = await targetRef.get();
  const current = (snap.data()?.reportedCount as number) ?? 0;
  const next = current + 1;

  // set-with-merge so the counters are also created if the private doc is missing
  await targetRef.set(
    {
      reportedCount: next,
      reportedFlag: next >= BAN_THRESHOLD,
    },
    { merge: true },
  );
});
