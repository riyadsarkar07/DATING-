import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';
import { AppNotification } from '../types/notification';
import { NotificationType } from '../types/enums';
import { useNotificationStore } from '../store/notification.store';

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  fromUid?: string | null;
  matchId?: string | null;
  link?: string | null;
}

class NotificationService {
  async createForUser(uid: string, input: CreateNotificationInput): Promise<void> {
    await db.collection(COLLECTIONS.notifications).add({
      userId: uid,
      type: input.type,
      title: input.title,
      body: input.body,
      fromUid: input.fromUid ?? null,
      fromName: null,
      fromPhoto: null,
      matchId: input.matchId ?? null,
      link: input.link ?? null,
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  async createForUsers(
    uids: string[],
    input: CreateNotificationInput,
    opts?: { skip?: string },
  ): Promise<void> {
    const batch = db.batch();
    uids.forEach((uid) => {
      if (opts?.skip && uid === opts.skip) return;
      const ref = db.collection(COLLECTIONS.notifications).doc();
      batch.set(ref, {
        userId: uid,
        type: input.type,
        title: input.title,
        body: input.body,
        fromUid: input.fromUid ?? null,
        fromName: null,
        fromPhoto: null,
        matchId: input.matchId ?? null,
        link: input.link ?? null,
        read: false,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }

  watchNotifications(uid: string, cb: (items: AppNotification[]) => void): () => void {
    return db
      .collection(COLLECTIONS.notifications)
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot(
        (snap) => {
          const items: AppNotification[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              type: data.type,
              title: data.title,
              body: data.body,
              fromUid: data.fromUid ?? null,
              fromName: data.fromName ?? null,
              fromPhoto: data.fromPhoto ?? null,
              matchId: data.matchId ?? null,
              link: data.link ?? null,
              read: data.read ?? false,
              createdAt: toMillis(data.createdAt),
            } as AppNotification;
          });
          cb(items);
        },
        () => cb([]),
      );
  }

  async markRead(id: string): Promise<void> {
    await db.collection(COLLECTIONS.notifications).doc(id).update({ read: true });
  }

  async markAllRead(uid: string): Promise<void> {
    const snap = await db
      .collection(COLLECTIONS.notifications)
      .where('userId', '==', uid)
      .where('read', '==', false)
      .get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  }

  async unreadCount(uid: string): Promise<number> {
    const snap = await db
      .collection(COLLECTIONS.notifications)
      .where('userId', '==', uid)
      .where('read', '==', false)
      .limit(100)
      .get();
    return snap.size;
  }

  onMessageReceived(remoteMessage: any): void {
    const data = remoteMessage?.data ?? {};
    const notification = remoteMessage?.notification ?? {};
    const type = (data.type as NotificationType) ?? 'system';
    const uid = useNotificationStore.getState().uid;
    if (!uid || data.userId !== uid) return;
    useNotificationStore.getState().prependLocal({
      id: data.id ?? `${Date.now()}`,
      type,
      title: data.title ?? notification.title ?? 'SparkX',
      body: data.body ?? notification.body ?? '',
      fromUid: data.fromUid ?? null,
      fromName: data.fromName ?? null,
      fromPhoto: data.fromPhoto ?? null,
      matchId: data.matchId ?? null,
      link: data.link ?? null,
      read: false,
      createdAt: Number(data.createdAt ?? Date.now()),
    });
  }
}

function toMillis(v: any): number {
  if (!v) return 0;
  if (v.toMillis) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

export const notificationService = new NotificationService();
