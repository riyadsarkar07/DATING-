import { create } from 'zustand';
import { AppNotification } from '../types/notification';

interface NotificationState {
  uid: string | null;
  items: AppNotification[];
  unread: number;
  setUid: (uid: string | null) => void;
  setItems: (items: AppNotification[]) => void;
  prependLocal: (item: AppNotification) => void;
  markReadLocal: (id: string) => void;
  markAllReadLocal: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  uid: null,
  items: [],
  unread: 0,

  setUid: (uid) => set({ uid }),

  setItems: (items) => {
    const unread = items.filter((i) => !i.read).length;
    set({ items, unread });
  },

  prependLocal: (item) =>
    set((state) => {
      if (state.items.some((i) => i.id === item.id)) return state;
      return { items: [item, ...state.items], unread: state.unread + 1 };
    }),

  markReadLocal: (id) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
      unread: Math.max(0, state.unread - 1),
    })),

  markAllReadLocal: () =>
    set((state) => ({
      items: state.items.map((i) => ({ ...i, read: true })),
      unread: 0,
    })),
}));
