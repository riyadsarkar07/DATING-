import { HttpsError } from 'firebase-functions/v2/https';
import { CallableRequest } from 'firebase-functions/v2/https';

export interface AuthContext {
  uid: string;
  token: Record<string, unknown>;
}

export function getAuth(request: CallableRequest): AuthContext {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to call this function.');
  }
  return { uid: request.auth.uid, token: request.auth.token };
}

export function requireAdmin(request: CallableRequest): AuthContext {
  const ctx = getAuth(request);
  if (ctx.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Admin role required.');
  }
  return ctx;
}
