import { CallType, CallStatus } from './enums';
import { PublicUserSummary } from './user';

export interface ReplyRef {
  id: string;
  senderId: string;
  text: string;
  kind: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  kind: string;
  text?: string;
  mediaUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  durationMs?: number;
  replyTo?: ReplyRef | null;
  deleted: boolean;
  readAt: number | null;
  deliveredAt: number | null;
  createdAt: number;
}

export interface MatchParticipant {
  uid: string;
  lastReadAt: number;
  unseenCount: number;
}

export interface Match {
  id: string;
  userIds: string[];
  otherUid: string;
  status: 'active' | 'blocked' | 'ended';
  matchedAt: number;
  lastMessageAt: number;
  lastMessagePreview: string;
  lastMessageKind: string;
  lastMessageSenderId: string;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
  unseenCount: number;
  otherReadAt: number;
  participants: Record<string, MatchParticipant>;
  otherUser: PublicUserSummary;
  typingUsers: string[];
}

export interface CallRecord {
  id: string;
  matchId: string;
  callerId: string;
  calleeId: string;
  type: CallType;
  status: CallStatus;
  startedAt: number;
  endedAt: number | null;
  durationSec: number;
}

export interface ActiveCall {
  matchId: string;
  peer: PublicUserSummary;
  type: CallType;
  callId: string;
  direction: 'outgoing' | 'incoming';
}
