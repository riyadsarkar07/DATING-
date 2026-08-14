import {
  getCurrentUser,
  loginWithEmail,
  registerWithEmail,
  sendOtpToPhone,
  signInWithGoogle,
  verifyOtp,
} from '../firebase/auth';
import { UserProfile, CreateAccountParams } from '../types/user';
import { userService } from './user.service';
import { AuthError } from '../core/errors/AuthError';
import { profileService } from './profile.service';
import { logEvent, setUserId, setUserProperties } from '../firebase/analytics';
import { setUid } from '../firebase/crashlytics';

class AuthService {
  async handleSignUp(params: CreateAccountParams): Promise<void> {
    await registerWithEmail(params);
    const user = getCurrentUser();
    if (!user) throw new AuthError('Could not create your account. Please try again.');
    await userService.initializeUser(user.uid, {
      email: user.email ?? params.email,
      displayName: params.displayName ?? '',
    });
    await this.tagUser(user.uid, user.email);
  }

  async handleLogin(email: string, password: string): Promise<void> {
    const res = await loginWithEmail(email, password);
    await this.tagUser(res.user.uid, res.user.email);
  }

  async handleGoogleLogin(idToken: string): Promise<void> {
    const res = await signInWithGoogle(idToken);
    const user = getCurrentUser();
    if (!user) throw new AuthError('Google sign-in failed.');
    const profile = await userService.getProfile(user.uid);
    if (!profile) {
      await userService.initializeUser(user.uid, {
        email: user.email ?? '',
        displayName: user.displayName ?? '',
      });
    }
    await this.tagUser(user.uid, user.email);
  }

  async handlePhoneOtp(phoneNumber: string): Promise<string> {
    return sendOtpToPhone(phoneNumber);
  }

  async handleVerifyOtp(verificationId: string, code: string): Promise<void> {
    const res = await verifyOtp(verificationId, code);
    const user = getCurrentUser();
    if (!user) throw new AuthError('Could not verify your code.');
    const profile = await userService.getProfile(user.uid);
    if (!profile) {
      await userService.initializeUser(user.uid, {
        email: user.email ?? '',
        displayName: res.user.displayName ?? '',
        phone: user.phoneNumber,
      });
    }
    await this.tagUser(user.uid, user.email);
  }

  async completeProfileSetup(profile: UserProfile): Promise<void> {
    await profileService.saveCompletedProfile(profile);
  }

  private async tagUser(uid: string, email: string | null): Promise<void> {
    await setUserId(uid);
    await setUid(uid);
    if (email) await setUserProperties({ email });
    logEvent('login_success', { user_id: uid });
  }
}

export const authService = new AuthService();
