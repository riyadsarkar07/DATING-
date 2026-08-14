import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_STORAGE_KEY } from '../constants/onboarding';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface MatchPopupData {
  candidateUid: string;
  candidateName: string;
  candidatePhotos: string[];
  matchId: string;
}

interface AppState {
  onboardingDone: boolean;
  hydrationDone: boolean;
  toast: ToastMessage | null;
  loading: boolean;
  matchPopup: MatchPopupData | null;
  bootstrapped: boolean;
  markOnboardingDone: () => Promise<void>;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
  showMatchPopup: (data: MatchPopupData) => void;
  hideMatchPopup: () => void;
  setProfileCompleteSnack: () => void;
  resetOnLogout: () => void;
  setBootstrapped: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  onboardingDone: false,
  hydrationDone: false,
  toast: null,
  loading: false,
  matchPopup: null,
  bootstrapped: false,

  markOnboardingDone: async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    set({ onboardingDone: true });
  },

  showToast: (message, type = 'info') => {
    const id = Date.now();
    set({ toast: { id, message, type } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, 2600);
  },

  hideToast: () => set({ toast: null }),
  setLoading: (loading) => set({ loading }),
  setBootstrapped: (v) => set({ bootstrapped: v }),

  showMatchPopup: (data) => set({ matchPopup: data }),
  hideMatchPopup: () => set({ matchPopup: null }),

  setProfileCompleteSnack: () => {
    get().showToast('Profile completed. Welcome to SparkX!', 'success');
  },

  resetOnLogout: () => {
    set({ matchPopup: null, toast: null });
  },
}));

export async function hydrateOnboarding(): Promise<void> {
  const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
  useAppStore.setState({ onboardingDone: value === 'true', hydrationDone: true });
}
