import { create } from 'zustand';
import { UserSettings, NotificationPrefs, PrivacyPrefs, settingsService } from '../services/settings.service';
import { AppLanguage } from '../types/enums';

interface SettingsState {
  settings: UserSettings | null;
  setSettings: (settings: UserSettings) => void;
  load: (uid: string) => Promise<void>;
  setTheme: (theme: 'dark' | 'system') => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  setNotificationPrefs: (prefs: NotificationPrefs) => Promise<void>;
  setPrivacyPrefs: (prefs: PrivacyPrefs) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,

  setSettings: (settings) => set({ settings }),

  load: async (uid) => {
    const settings = await settingsService.get(uid);
    set({ settings });
  },

  setTheme: async (theme) => {
    const uid = get().settings?.uid;
    if (!uid) return;
    await settingsService.save(uid, { theme });
    set((s) => ({ settings: s.settings ? { ...s.settings, theme } : s.settings }));
  },

  setLanguage: async (language) => {
    const uid = get().settings?.uid;
    if (!uid) return;
    await settingsService.save(uid, { language });
    set((s) => ({ settings: s.settings ? { ...s.settings, language } : s.settings }));
  },

  setNotificationPrefs: async (prefs) => {
    const uid = get().settings?.uid;
    if (!uid) return;
    await settingsService.setNotificationPrefs(uid, prefs);
    set((s) => ({ settings: s.settings ? { ...s.settings, notificationPrefs: prefs } : s.settings }));
  },

  setPrivacyPrefs: async (prefs) => {
    const uid = get().settings?.uid;
    if (!uid) return;
    await settingsService.setPrivacyPrefs(uid, prefs);
    set((s) => ({ settings: s.settings ? { ...s.settings, privacyPrefs: prefs } : s.settings }));
  },
}));
