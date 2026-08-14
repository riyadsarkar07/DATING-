import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';
import { AppLanguage } from '../types/enums';

export interface NotificationPrefs {
  likes: boolean;
  matches: boolean;
  messages: boolean;
  visitors: boolean;
  premium: boolean;
  system: boolean;
}

export interface PrivacyPrefs {
  showOnlineStatus: boolean;
  showDistance: boolean;
  showAge: boolean;
  showPhotosToNonMatched: boolean;
  discoverable: boolean;
}

export interface UserSettings {
  uid: string;
  theme: 'dark' | 'system';
  language: AppLanguage;
  notificationPrefs: NotificationPrefs;
  privacyPrefs: PrivacyPrefs;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  likes: true,
  matches: true,
  messages: true,
  visitors: true,
  premium: true,
  system: true,
};

const DEFAULT_PRIVACY_PREFS: PrivacyPrefs = {
  showOnlineStatus: true,
  showDistance: true,
  showAge: true,
  showPhotosToNonMatched: true,
  discoverable: true,
};

class SettingsService {
  async get(uid: string): Promise<UserSettings> {
    const doc = await db.collection(COLLECTIONS.settings).doc(uid).get();
    if (!doc.exists) return this.defaults(uid);
    const data = doc.data() as any;
    return {
      uid,
      theme: data.theme ?? 'dark',
      language: data.language ?? 'en',
      notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS, ...(data.notificationPrefs ?? {}) },
      privacyPrefs: { ...DEFAULT_PRIVACY_PREFS, ...(data.privacyPrefs ?? {}) },
    };
  }

  defaults(uid: string): UserSettings {
    return {
      uid,
      theme: 'dark',
      language: 'en',
      notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
      privacyPrefs: { ...DEFAULT_PRIVACY_PREFS },
    };
  }

  async save(uid: string, patch: Partial<UserSettings>): Promise<void> {
    await db.collection(COLLECTIONS.settings).doc(uid).set(
      { ...patch, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  async setNotificationPrefs(uid: string, prefs: NotificationPrefs): Promise<void> {
    await this.save(uid, { notificationPrefs: prefs });
  }

  async setPrivacyPrefs(uid: string, prefs: PrivacyPrefs): Promise<void> {
    await this.save(uid, { privacyPrefs: prefs });
  }

  async watch(uid: string, cb: (settings: UserSettings) => void): Promise<() => void> {
    return db.collection(COLLECTIONS.settings).doc(uid).onSnapshot((doc) => {
      if (!doc.exists) return cb(this.defaults(uid));
      const data = doc.data() as any;
      cb({
        uid,
        theme: data.theme ?? 'dark',
        language: data.language ?? 'en',
        notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS, ...(data.notificationPrefs ?? {}) },
        privacyPrefs: { ...DEFAULT_PRIVACY_PREFS, ...(data.privacyPrefs ?? {}) },
      });
    });
  }
}

export const settingsService = new SettingsService();
