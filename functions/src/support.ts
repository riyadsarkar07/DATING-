import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { requireAdmin } from './guards';

const db = admin.firestore();

interface TicketData {
  ticketId?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigneeUid?: string;
  assigneeName?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/** Admin updates ticket lifecycle fields (status, priority, assignment). */
export const updateSupportTicket = onCall(async (request: CallableRequest<TicketData>) => {
  requireAdmin(request);
  const data = request.data ?? {};
  if (!data.ticketId) {
    throw new HttpsError('invalid-argument', 'ticketId is required.');
  }

  const update: Record<string, unknown> = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if (data.status) update.status = data.status;
  if (data.priority) update.priority = data.priority;
  if (typeof data.assigneeUid === 'string') {
    update.assigneeUid = data.assigneeUid;
    update.assigneeName = data.assigneeName ?? '';
    update.assignedAt = admin.firestore.FieldValue.serverTimestamp();
  }

  await db.collection('support').doc(data.ticketId).update(update);
  return { ok: true };
});

interface ReplyData {
  ticketId?: string;
  message?: string;
}

/**
 * Admin replies to a support ticket. Writes a message into the ticket's
 * `messages` subcollection and pushes an FCM notification to the ticket owner.
 */
export const sendSupportReply = onCall(async (request: CallableRequest<ReplyData>) => {
  const adminCtx = requireAdmin(request);
  const data = request.data ?? {};
  const ticketId = data.ticketId;
  const text = (data.message ?? '').trim();
  if (!ticketId || !text) {
    throw new HttpsError('invalid-argument', 'ticketId and message are required.');
  }

  const ticketRef = db.collection('support').doc(ticketId);
  const ticketSnap = await ticketRef.get();
  if (!ticketSnap.exists) {
    throw new HttpsError('not-found', 'Ticket not found.');
  }
  const ticket = ticketSnap.data() as { userId?: string; status?: string };

  const messageRef = ticketRef.collection('messages').doc();
  await messageRef.set({
    ticketId,
    senderUid: adminCtx.uid,
    senderRole: 'admin',
    text,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await ticketRef.update({
    status: 'in_progress',
    lastReplyAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (ticket.userId) {
    const userSnap = await db.collection('users').doc(ticket.userId).collection('private').doc('profile').get();
    const fcmToken = userSnap.data()?.fcmToken as string | undefined;
    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title: 'Support', body: text },
        data: { type: 'support_reply', ticketId, screen: 'ContactSupport' },
        android: { priority: 'high' },
      }).catch(() => {});
    }
  }

  return { ok: true, messageId: messageRef.id };
});

/**
 * Trigger: when a support agent is assigned to a ticket, notify the owner.
 * Kept lightweight — the reply path already notifies via sendSupportReply.
 */
export const onSupportMessageCreated = onDocumentCreated('support/{ticketId}/messages/{messageId}', async (event) => {
  const data = event.data?.data();
  const senderRole = data?.senderRole as string | undefined;
  const ticketId = event.params.ticketId;
  if (senderRole !== 'admin' || !ticketId) return;

  const ticketSnap = await db.collection('support').doc(ticketId).get();
  const ownerUid = ticketSnap.data()?.userId as string | undefined;
  if (!ownerUid) return;

  const userSnap = await db.collection('users').doc(ownerUid).collection('private').doc('profile').get();
  const fcmToken = userSnap.data()?.fcmToken as string | undefined;
  if (!fcmToken) return;

  await admin.messaging().send({
    token: fcmToken,
    notification: { title: 'Support', body: (data?.text as string) ?? 'You have a new reply.' },
    data: { type: 'support_reply', ticketId, screen: 'ContactSupport' },
  }).catch(() => {});
});
