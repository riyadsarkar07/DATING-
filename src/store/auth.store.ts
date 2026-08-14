import { create } from 'zustand';
import { onAuthStateChanged, signOut as fbSignOut } from '../firebase/auth';
import { userService } from '../services/user.service';
import { profileService } from '../services/profile.service';
import { UserProfile } from '../types/user';
import { AuthStatus } from '../types/enums';
import { setUserId } from '../firebase/analytics';
import { setUid } from '../firebase/crashlytics';
import { useAppStore } from './app.store';

interface AuthState {
  status: AuthStatus;
  uid: string | null;
  email: string | null;
  profile: UserProfile | null;
  bootstrapError: string | null;
  setProfile: (profile: UserProfile) => void;
  patchProfile: (patch: Partial<UserProfile>) => void;
  setIncompleteProfile: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeProfile: (profile: UserProfile) => Promise<void>;
  bootstrap: () => Promise<void>;
}

let unsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'unknown',
  uid: null,
  email: null,
  profile: null,
  bootstrapError: null,

  bootstrap: async () => {
    if (unsubscribe) unsubscribe();
    unsubscribe = onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          set({ status: 'unauthenticated', uid: null, email: null, profile: null, bootstrapError: null });
          await setUserId(null);
          await setUid(null);
          return;
        }
        set({ uid: user.uid, email: user.email });
        await setUserId(user.uid);
        await setUid(user.uid);

        const profile = await userService.getOwnProfile(user.uid);
        if (!profile || !profile.setupComplete) {
          set({ status: 'incomplete-profile', profile: null, bootstrapError: null });
          return;
        }
        set({ status: 'authenticated', profile, bootstrapError: null });
      } catch (err) {
        set({
          bootstrapError: (err as Error).message,
          status: user ? 'unauthenticated' : 'unauthenticated',
        });
      }
    });
  },

  setProfile: (profile) => set({ profile, status: 'authenticated' }),

  patchProfile: (patch) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...patch };
    set({ profile: updated });
    userService.upsert(current.uid, patch as any).catch(() => {});
  },

  setIncompleteProfile: () => set({ status: 'incomplete-profile', profile: null }),

  refreshProfile: async () => {
    const uid = get().uid;
    if (!uid) return;
    const profile = await userService.getProfile(uid);
    if (profile) set({ profile });
  },

  completeProfile: async (profile) => {
    await profileService.saveCompletedProfile(profile);
    set({ profile, status: 'authenticated' });
    useAppStore.getState().setProfileCompleteSnack();
  },

  logout: async () => {
    await fbSignOut();
    set({ status: 'unauthenticated', uid: null, email: null, profile: null });
    useAppStore.getState().resetOnLogout();
  },
}));
