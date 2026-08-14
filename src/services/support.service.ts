import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';

export interface SupportTicket {
  id?: string;
  userId: string;
  subject: string;
  message: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  assigneeUid?: string;
  assigneeName?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface SupportMessage {
  id?: string;
  ticketId: string;
  senderUid: string;
  senderRole: 'user' | 'admin';
  text: string;
  status?: 'sent' | 'delivered' | 'read';
  createdAt: number;
}

class SupportService {
  async create(userId: string, input: { subject: string; message: string; category: string }): Promise<string> {
    const ref = await db.collection(COLLECTIONS.support).add({
      userId,
      subject: input.subject,
      message: input.message,
      category: input.category,
      status: 'open',
      priority: 'normal',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await ref.collection('messages').add({
      ticketId: ref.id,
      senderUid: userId,
      senderRole: 'user',
      text: input.message,
      status: 'sent',
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  async updateStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    await db.collection(COLLECTIONS.support).doc(ticketId).update({
      status,
      updatedAt: serverTimestamp(),
    });
  }

  /** Realtime watch of a single ticket (status, assignee, priority, etc.). */
  async watchTicket(ticketId: string, cb: (ticket: SupportTicket | null) => void): Promise<() => void> {
    return db
      .collection(COLLECTIONS.support)
      .doc(ticketId)
      .onSnapshot((snap) => {
        if (!snap.exists) {
          cb(null);
          return;
        }
        cb(mapTicket(snap.id, snap.data() as any));
      });
  }

  async watchMine(uid: string, cb: (tickets: SupportTicket[]) => void): Promise<() => void> {
    return db
      .collection(COLLECTIONS.support)
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snap) => {
        const tickets: SupportTicket[] = snap.docs.map((d) => mapTicket(d.id, d.data() as any));
        cb(tickets);
      });
  }

  /** Real-time live-support thread: watch every message on one of the user's tickets. */
  async watchMessages(ticketId: string, cb: (messages: SupportMessage[]) => void): Promise<() => void> {
    return db
      .collection(COLLECTIONS.support)
      .doc(ticketId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot((snap) => {
        const messages: SupportMessage[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            ticketId: data.ticketId,
            senderUid: data.senderUid,
            senderRole: data.senderRole,
            text: data.text,
            status: data.status,
            createdAt: toMillis(data.createdAt),
          };
        });
        cb(messages);
      });
  }

  /** Send a message from the user into their ticket thread (role 'user'). */
  async sendMessage(ticketId: string, senderUid: string, text: string): Promise<string> {
    const ref = await db.collection(COLLECTIONS.support).doc(ticketId).collection('messages').add({
      ticketId,
      senderUid,
      senderRole: 'user',
      text,
      status: 'sent',
      createdAt: serverTimestamp(),
    });
    await db.collection(COLLECTIONS.support).doc(ticketId).update({
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }
}

function mapTicket(id: string, data: any): SupportTicket {
  return {
    id,
    userId: data.userId,
    subject: data.subject,
    message: data.message,
    category: data.category,
    status: data.status,
    priority: data.priority,
    assigneeUid: data.assigneeUid,
    assigneeName: data.assigneeName,
    createdAt: toMillis(data.createdAt),
    updatedAt: data.updatedAt ? toMillis(data.updatedAt) : undefined,
  };
}

function toMillis(v: any): number {
  if (!v) return 0;
  if (v.toMillis) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

export const supportService = new SupportService();
