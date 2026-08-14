import { useAuthStore } from './auth.store';
import { useAppStore } from './app.store';
import { useDiscoveryStore } from './discovery.store';
import { useChatStore } from './chat.store';
import { useNotificationStore } from './notification.store';
import { usePremiumStore } from './premium.store';
import { useSettingsStore } from './settings.store';

export { useAuthStore } from './auth.store';
export { useAppStore } from './app.store';
export { useDiscoveryStore } from './discovery.store';
export { useChatStore } from './chat.store';
export { useNotificationStore } from './notification.store';
export { usePremiumStore } from './premium.store';
export { useSettingsStore } from './settings.store';

export const store = {
  getState: () => ({
    auth: useAuthStore.getState(),
    app: useAppStore.getState(),
    discovery: useDiscoveryStore.getState(),
    chat: useChatStore.getState(),
    notification: useNotificationStore.getState(),
    premium: usePremiumStore.getState(),
    settings: useSettingsStore.getState(),
  }),
};
