import auth from '@react-native-firebase/auth';
import { AuthError } from '../core/errors/AuthError';
import { getErrorMessage } from '../core/errors/FirebaseErrorMessage';
import { AuthResult, CreateAccountParams } from '../types';

const authInstance = auth();

try {
  authInstance.settings.appVerificationDisabledForTesting = __DEV__;
} catch {
  // ignored on platforms where testing flag is unavailable
}

export const onAuthStateChanged = (cb: (user: any) => void): (() => void) => {
  return authInstance.onAuthStateChanged(cb);
};

export const getCurrentUser = () => authInstance.currentUser;

export async function registerWithEmail(params: CreateAccountParams): Promise<AuthResult> {
  try {
    const credential = await authInstance.createUserWithEmailAndPassword(params.email, params.password);
    if (params.displayName) {
      await credential.user.updateProfile({ displayName: params.displayName });
    }
    return { user: credential.user };
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const credential = await authInstance.signInWithEmailAndPassword(email.trim(), password);
    return { user: credential.user };
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function signInWithGoogle(idToken: string): Promise<AuthResult> {
  try {
    const credential = await authInstance.signInWithCredential(
      auth.GoogleAuthProvider.credential(idToken),
    );
    return { user: credential.user };
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function sendOtpToPhone(phoneNumber: string): Promise<string> {
  try {
    const confirmation = await authInstance.signInWithPhoneNumber(phoneNumber);
    return confirmation.verificationId ?? '';
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function verifyOtp(verificationId: string, code: string): Promise<AuthResult> {
  try {
    const credential = auth.PhoneAuthProvider.credential(verificationId, code);
    const res = await authInstance.signInWithCredential(credential);
    return { user: res.user };
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await authInstance.sendPasswordResetEmail(email.trim());
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function sendEmailVerification(): Promise<void> {
  try {
    const user = getCurrentUser();
    if (!user) throw new AuthError('No authenticated user.');
    await user.sendEmailVerification();
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function refreshEmailVerification(): Promise<boolean> {
  try {
    const user = getCurrentUser();
    if (!user) return false;
    await user.reload();
    return user.emailVerified;
  } catch (err) {
    return false;
  }
}

export async function updateProfilePhoto(photoUrl: string): Promise<void> {
  try {
    const user = getCurrentUser();
    await user?.updateProfile({ photoURL: photoUrl });
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function updateDisplayName(displayName: string): Promise<void> {
  try {
    const user = getCurrentUser();
    await user?.updateProfile({ displayName });
  } catch (err) {
    throw new AuthError(getErrorMessage(err), err);
  }
}

export async function signOut(): Promise<void> {
  await authInstance.signOut();
}

export async function deleteFirebaseUser(): Promise<void> {
  const user = getCurrentUser();
  if (user) await user.delete();
}

export async function reauthenticate(password: string): Promise<void> {
  const user = getCurrentUser();
  if (!user?.email) throw new AuthError('Email sign-in required to reauthenticate.');
  const credential = auth.EmailAuthProvider.credential(user.email, password);
  await user.reauthenticateWithCredential(credential);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new AuthError('No signed-in user.');
  await user.updatePassword(newPassword);
}
