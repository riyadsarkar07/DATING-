import { NotificationType } from './enums';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  fromUid: string | null;
  fromName: string | null;
  fromPhoto: string | null;
  matchId: string | null;
  link: string | null;
  read: boolean;
  createdAt: number;
}
