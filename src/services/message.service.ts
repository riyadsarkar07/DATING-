import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';
import { ChatMessage, ReplyRef } from '../types/chat';
import { matchService } from './match.service';
import { uploadVoiceMessage } from '../firebase/storage';
import { firestore } from '../firebase';

class MessageService {
  watchMessages(matchId: string, cb: (messages: ChatMessage[]) => void): () => void {
    return db
      .collection(COLLECTIONS.messages)
      .where('matchId', '==', matchId)
      .orderBy('createdAt', 'asc')
      .onSnapshot((snap) => {
        const messages: ChatMessage[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            matchId: data.matchId,
            senderId: data.senderId,
            kind: data.kind,
            text: data.text,
            mediaUrl: data.mediaUrl,
            mediaWidth: data.mediaWidth,
            mediaHeight: data.mediaHeight,
            durationMs: data.durationMs,
            replyTo: data.replyTo ?? null,
            deleted: data.deleted ?? false,
            readAt: data.readAt ? toMillis(data.readAt) : null,
            deliveredAt: data.deliveredAt ? toMillis(data.deliveredAt) : null,
            createdAt: toMillis(data.createdAt),
          } as ChatMessage;
        });
        cb(messages);
      });
  }

  async sendText(matchId: string, senderId: string, text: string, replyTo?: ReplyRef | null): Promise<void> {
    await this.create({
      matchId,
      senderId,
      kind: 'text',
      text,
      replyTo: replyTo ?? null,
    });
  }

  async sendEmoji(matchId: string, senderId: string, emoji: string): Promise<void> {
    await this.create({ matchId, senderId, kind: 'emoji', text: emoji });
  }

  async sendGif(matchId: string, senderId: string, url: string): Promise<void> {
    await this.create({ matchId, senderId, kind: 'gif', mediaUrl: url });
  }

  async sendImage(matchId: string, senderId: string, url: string, width?: number, height?: number): Promise<void> {
    await this.create({ matchId, senderId, kind: 'image', mediaUrl: url, mediaWidth: width, mediaHeight: height });
  }

  async sendVideo(matchId: string, senderId: string, url: string): Promise<void> {
    await this.create({ matchId, senderId, kind: 'video', mediaUrl: url });
  }

  async sendVoice(matchId: string, senderId: string, uri: string, durationMs: number): Promise<void> {
    const url = await uploadVoiceMessage(senderId, uri);
    await this.create({ matchId, senderId, kind: 'voice', mediaUrl: url, durationMs });
  }

  private async create(data: {
    matchId: string;
    senderId: string;
    kind: string;
    text?: string;
    mediaUrl?: string;
    mediaWidth?: number;
    mediaHeight?: number;
    durationMs?: number;
    replyTo?: ReplyRef | null;
  }): Promise<void> {
    await db.collection(COLLECTIONS.messages).add({
      ...data,
      createdAt: serverTimestamp(),
      readAt: null,
      deliveredAt: serverTimestamp(),
      deleted: false,
    });
    const preview = this.previewOf(data);
    await matchService.updateLastMessage(data.matchId, preview, data.kind, data.senderId);
    await this.bumpUnseen(data.matchId, data.senderId);
  }

  private previewOf(data: any): string {
    switch (data.kind) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎬 Video';
      case 'voice':
        return '🎤 Voice message';
      case 'emoji':
        return data.text ?? '😊';
      case 'gif':
        return 'GIF';
      case 'system':
        return data.text ?? '';
      default:
        return data.text ?? '';
    }
  }

  private async bumpUnseen(matchId: string, senderId: string): Promise<void> {
    const match = await matchService.getMatchById(matchId);
    if (!match) return;
    for (const uid of match.userIds) {
      if (uid === senderId) continue;
      const current = match.participants?.[uid]?.unseenCount ?? 0;
      await db
        .collection(COLLECTIONS.matches)
        .doc(matchId)
        .set({ [`participants.${uid}.unseenCount`]: current + 1 }, { merge: true });
    }
  }

  async markReadMessages(matchId: string, senderId: string, messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    const batch = db.batch();
    messageIds.forEach((id) => {
      batch.update(db.collection(COLLECTIONS.messages).doc(id), {
        readAt: firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
    await matchService.markRead(matchId, senderId);
  }

  async deleteMessage(message: ChatMessage): Promise<void> {
    await db.collection(COLLECTIONS.messages).doc(message.id).update({ deleted: true, text: '' });
  }

  async setTyping(matchId: string, uid: string, typing: boolean): Promise<void> {
    await db
      .collection(COLLECTIONS.matches)
      .doc(matchId)
      .set(
        {
          typingUsers: typing
            ? firestore.FieldValue.arrayUnion(uid)
            : firestore.FieldValue.arrayRemove(uid),
        },
        { merge: true },
      );
  }
}

function toMillis(v: any): number {
  if (!v) return 0;
  if (v.toMillis) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

export const messageService = new MessageService();
