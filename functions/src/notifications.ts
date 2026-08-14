import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

const db = admin.firestore();
const TS = admin.firestore.FieldValue.serverTimestamp;

/**
 * Generic FCM push helper for backend-initiated notifications.
 * In-flight notifications to a user's current FCM token (stored in the
 * user's private profile doc).
 */
export async function pushToUser(
  uid: string,
  notification: { title: string; body: string },
  data: Record<string, string>,
): Promise<void> {
  const snap = await db.collection('users').doc(uid).collection('private').doc('profile').get();
  const fcmToken = snap.data()?.fcmToken as string | undefined;
  if (!fcmToken) return;

  await admin
    .messaging()
    .send({
      token: fcmToken,
      notification,
      data,
      android: { priority: 'high' },
    })
    .catch(() => {});
}

/**
 * When a match is created, write the "It's a match!" inbox notification for
 * BOTH users. Notifications for other users can no longer be written by the
 * client (rules require `userId == request.auth.uid`), so this runs server-side.
 */
export const onMatchCreated = onDocumentCreated('matches/{matchId}', async (event) => {
  const data = event.data?.data();
  const userIds = (data?.userIds ?? []) as string[];
  if (userIds.length !== 2) return;
  const [a, b] = userIds;
  const [aSnap, bSnap] = await Promise.all([
    db.collection('users').doc(a).get(),
    db.collection('users').doc(b).get(),
  ]);
  const aData = aSnap.data() ?? {};
  const bData = bSnap.data() ?? {};
  const aName = (aData.displayName as string) || 'someone';
  const bName = (bData.displayName as string) || 'someone';
  const aPhoto = (aData.photos?.[0] as string) ?? null;
  const bPhoto = (bData.photos?.[0] as string) ?? null;
  const matchId = event.params.matchId;

  const batch = db.batch();
  batch.set(db.collection('notifications').doc(), {
    userId: a,
    type: 'match',
    title: "It's a match!",
    body: `You and ${bName} liked each other.`,
    fromUid: b,
    fromName: bName,
    fromPhoto: bPhoto,
    matchId,
    link: 'chat',
    read: false,
    createdAt: TS(),
  });
  batch.set(db.collection('notifications').doc(), {
    userId: b,
    type: 'match',
    title: "It's a match!",
    body: `You and ${aName} liked each other.`,
    fromUid: a,
    fromName: aName,
    fromPhoto: aPhoto,
    matchId,
    link: 'chat',
    read: false,
    createdAt: TS(),
  });
  await batch.commit();
});

/**
 * When a chat message is created, write the recipient's inbox notification and
 * push it via FCM (using the recipient's private fcmToken).
 */
export const onMessageCreated = onDocumentCreated('messages/{messageId}', async (event) => {
  const data = event.data?.data();
  const matchId = data?.matchId as string | undefined;
  const senderId = data?.senderId as string | undefined;
  if (!matchId || !senderId || senderId === 'system') return;
  if (data?.kind === 'system') return;
  const text = (data?.text ?? '').toString().slice(0, 300);
  if (!text.trim()) return;

  const matchSnap = await db.collection('matches').doc(matchId).get();
  const userIds = (matchSnap.data()?.userIds ?? []) as string[];
  const recipient = userIds.find((id: string) => id !== senderId);
  if (!recipient) return;

  const senderSnap = await db.collection('users').doc(senderId).get();
  const senderName = (senderSnap.data()?.displayName as string) || 'SparkX';
  const senderPhoto = (senderSnap.data()?.photos?.[0] as string) ?? null;

  await db.collection('notifications').add({
    userId: recipient,
    type: 'message',
    title: senderName,
    body: text,
    fromUid: senderId,
    fromName: senderName,
    fromPhoto: senderPhoto,
    matchId,
    link: 'chat',
    read: false,
    createdAt: TS(),
  });

  const privSnap = await db.collection('users').doc(recipient).collection('private').doc('profile').get();
  const fcmToken = privSnap.data()?.fcmToken as string | undefined;
  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title: senderName, body: text },
      data: { type: 'message', matchId, screen: 'chat' },
      android: { priority: 'high' },
    }).catch(() => {});
  }
});

/**
 * When a call record is created with status 'missed', notify the participant
 * identified by the `notifyTo` field (written by the client).
 */
export const onCallHistoryCreated = onDocumentCreated('call_history/{callId}', async (event) => {
  const data = event.data?.data();
  if ((data?.status as string) !== 'missed') return;
  const callerId = data?.callerId as string | undefined;
  const calleeId = data?.calleeId as string | undefined;
  if (!callerId || !calleeId) return;

  const notifyTo = (data?.notifyTo as 'caller' | 'callee') ?? 'callee';
  const targetUid = notifyTo === 'caller' ? callerId : calleeId;
  const type = (data?.type as string) === 'video' ? 'video' : 'voice';

  await db.collection('notifications').add({
    userId: targetUid,
    type: 'system',
    title: 'Missed call',
    body: type === 'video' ? 'You missed a video call' : 'You missed a voice call',
    fromUid: null,
    fromName: null,
    fromPhoto: null,
    matchId: data?.matchId ?? null,
    link: 'calls',
    read: false,
    createdAt: TS(),
  });
});
