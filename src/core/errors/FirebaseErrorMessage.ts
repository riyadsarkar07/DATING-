import { AppError } from './AppError';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  const code = extractCode(error);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try logging in instead.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for help.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-verification-code':
      return 'The verification code is invalid.';
    case 'auth/code-expired':
      return 'The verification code has expired. Request a new one.';
    case 'auth/invalid-phone-number':
      return 'That phone number is not valid.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Try a different sign-in method.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later.';
    case 'auth/requires-recent-login':
      return 'For security, please log in again before making this change.';
    case 'storage/unauthorized':
      return 'You do not have permission to access this file.';
    case 'storage/canceled':
      return 'Upload was cancelled.';
    case 'permission-denied':
      return 'You do not have permission to do that.';
    case 'unavailable':
      return 'Firebase is temporarily unavailable. Please retry.';
    case 'not-found':
      return 'That record no longer exists.';
    case 'already-exists':
      return 'That record already exists.';
    case 'invalid-argument':
      return 'The data provided is not valid.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function getErrorMessageFrom(message: string | undefined): string {
  if (!message) return 'Something went wrong. Please try again.';
  const code = extractCode(message);
  if (code) return getErrorMessage({ code });
  return message;
}

function extractCode(error: unknown): string | undefined {
  if (typeof error === 'string') {
    const match = error.match(/([a-z]+\/[a-z-]+)/);
    return match ? match[1] : undefined;
  }
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const code = typeof err.code === 'string' ? err.code : undefined;
    if (code) return code;
    if (err.error && typeof err.error === 'object') {
      return extractCode(err.error);
    }
  }
  return undefined;
}
