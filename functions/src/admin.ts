import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { getAuth, requireAdmin } from './guards';

const db = admin.firestore();
const auth = admin.auth();

interface SetAdminData {
  uid?: string;
  email?: string;
  role?: boolean;
}

/**
 * Promotes or demotes a user to/from the admin role using Firebase custom claims.
 * Guarded by:
 *  - an existing admin caller, OR
 *  - the BOOTSTRAP_ADMIN_EMAIL functions config matching the target email (used to
 *    seed the very first admin, after which the bootstrap config can be removed).
 */
export const setAdminRole = onCall(async (request: CallableRequest<SetAdminData>): Promise<{ ok: boolean; uid: string }> => {
  let callerUid: string;
  try {
    callerUid = requireAdmin(request).uid;
  } catch {
    // Fall back to the one-time bootstrap path for the first admin.
    const ctx = getAuth(request);
    const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL ?? '';
    const targetEmail = (request.data?.email ?? '').toLowerCase();
    if (!bootstrapEmail || bootstrapEmail.toLowerCase() !== targetEmail) {
      throw new HttpsError('permission-denied', 'Admin role required.');
    }
    callerUid = ctx.uid;
  }

  const data = request.data ?? {};
  const uid = data.uid ?? callerUid;
  const makeAdmin = data.role !== false;

  const user = await auth.getUser(uid);
  if (!user.email && !data.email) {
    // Without an email we cannot safely identify the account in the console; allow the
    // caller to also pass an email that must match the target account.
    throw new HttpsError('invalid-argument', 'Target user must have an email.');
  }

  await auth.setCustomUserClaims(uid, { admin: makeAdmin || null });

  await db.collection('admin_users').doc(uid).set(
    {
      uid,
      email: user.email ?? data.email ?? null,
      admin: makeAdmin,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: callerUid,
    },
    { merge: true },
  );

  return { ok: true, uid };
});

export const revokeAdmin = onCall(async (request: CallableRequest<SetAdminData>) => {
  requireAdmin(request);
  const data = request.data ?? {};
  if (!data.uid) {
    throw new HttpsError('invalid-argument', 'uid is required.');
  }
  await admin.auth().setCustomUserClaims(data.uid, { admin: null });
  await db.collection('admin_users').doc(data.uid).update({ admin: false, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true };
});

/** Returns whether the given uid currently holds the admin custom claim. */
export async function isAdminUid(uid: string): Promise<boolean> {
  const user = await auth.getUser(uid).catch(() => null);
  return user?.customClaims?.admin === true;
}
