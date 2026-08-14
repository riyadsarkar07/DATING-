import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';
import { Match } from '../types/chat';
import { userService } from './user.service';
import { PublicUserSummary } from '../types/user';

class MatchService {
  watchMatches(uid: string, cb: (matches: Match[]) => void): () => void {
    const query = db
      .collection(COLLECTIONS.matches)
      .where('userIds', 'array-contains', uid)
      .orderBy('lastMessageAt', 'desc');

    return query.onSnapshot(async (snap) => {
      try {
        const raws = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        const otherUids = raws
          .map((r) => (r.userIds || []).find((id: string) => id !== uid))
          .filter((v: string | undefined): v is string => !!v);
        const summaries = await userService.getPublicUsers([...new Set(otherUids)]);
        const summaryMap: Record<string, PublicUserSummary> = {};
        summaries.forEach((s) => {
          summaryMap[s.uid] = s;
        });
        const matches: Match[] = raws
          .map((r) => {
            const otherUid = (r.userIds || []).find((id: string) => id !== uid);
            const other = otherUid ? summaryMap[otherUid] : undefined;
            if (!other || !otherUid) return null;
            const participants = r.participants ?? {};
            const mine = participants[uid] ?? { lastReadAt: 0, unseenCount: 0 };
            const theirs = participants[otherUid] ?? { lastReadAt: 0, unseenCount: 0 };
            return {
              id: r.id,
              userIds: r.userIds,
              otherUid,
              status: r.status,
              matchedAt: toMillis(r.matchedAt),
              lastMessageAt: toMillis(r.lastMessageAt),
              lastMessagePreview: r.lastMessagePreview ?? '',
              lastMessageKind: r.lastMessageKind ?? 'text',
              lastMessageSenderId: r.lastMessageSenderId ?? '',
              isArchived: r.isArchived ?? false,
              isPinned: r.isPinned ?? false,
              isMuted: r.isMuted ?? false,
              unseenCount: mine.unseenCount ?? 0,
              otherReadAt: theirs.lastReadAt ?? 0,
              participants,
              otherUser: other,
              typingUsers: [],
            } as Match;
          })
          .filter((m): m is Match => m !== null);
        cb(matches);
      } catch {
        cb([]);
      }
    });
  }

  async getMatchByUsers(uidA: string, uidB: string): Promise<Match | null> {
    const snap = await db
      .collection(COLLECTIONS.matches)
      .where('userIds', 'array-contains', uidA)
      .limit(50)
      .get();
    for (const d of snap.docs) {
      const data = d.data() as any;
      if (data.userIds?.includes(uidB)) {
        const other = await userService.getProfile(uidB);
        return {
          id: d.id,
          userIds: data.userIds,
          otherUid: uidB,
          status: data.status,
          matchedAt: toMillis(data.matchedAt),
          lastMessageAt: toMillis(data.lastMessageAt),
          lastMessagePreview: data.lastMessagePreview ?? '',
          lastMessageKind: data.lastMessageKind ?? 'text',
          lastMessageSenderId: data.lastMessageSenderId ?? '',
          isArchived: data.isArchived ?? false,
          isPinned: data.isPinned ?? false,
          isMuted: data.isMuted ?? false,
          unseenCount: (data.participants?.[uidA]?.unseenCount) ?? 0,
          otherReadAt: (data.participants?.[uidA]?.lastReadAt) ?? 0,
          participants: data.participants ?? {},
          otherUser: other
            ? (userService.mapToSummary({ ...other, uid: other.uid } as any) ?? ({
                uid: other.uid,
                displayName: other.displayName,
                photos: other.photos,
                age: other.age,
                gender: other.gender,
                occupation: other.occupation,
                bio: other.bio,
                distanceKm: null,
                online: other.online,
                lastActive: other.lastActive,
                verified: other.verified,
                premium: other.premium,
                premiumTier: other.premiumTier,
                boostUntil: other.boostUntil,
                hobbies: other.hobbies,
                languages: other.languages,
                religion: other.religion,
                education: other.education,
                relationshipGoal: other.relationshipGoal,
                height: other.height,
                city: other.city,
                country: other.country,
                videoIntro: other.videoIntro,
                instagram: other.instagram,
                spotify: other.spotify,
              } as PublicUserSummary))
            : ({} as PublicUserSummary),
          typingUsers: [],
        };
      }
    }
    return null;
  }

  watchMatch(matchId: string, cb: (data: { typingUsers: string[]; isMuted: boolean; participants: any; status: string }) => void): () => void {
    return db.collection(COLLECTIONS.matches).doc(matchId).onSnapshot((d) => {
      if (!d.exists) return;
      const data = d.data() as any;
      cb({
        typingUsers: data.typingUsers ?? [],
        isMuted: data.isMuted ?? false,
        participants: data.participants ?? {},
        status: data.status ?? 'active',
      });
    });
  }

  async getMatchById(matchId: string): Promise<Match | null> {    const d = await db.collection(COLLECTIONS.matches).doc(matchId).get();
    if (!d.exists) return null;
    const data = d.data() as any;
    return {
      id: d.id,
      userIds: data.userIds ?? [],
      otherUid: '',
      status: data.status ?? 'active',
      matchedAt: toMillis(data.matchedAt),
      lastMessageAt: toMillis(data.lastMessageAt),
      lastMessagePreview: data.lastMessagePreview ?? '',
      lastMessageKind: data.lastMessageKind ?? 'text',
      lastMessageSenderId: data.lastMessageSenderId ?? '',
      isArchived: data.isArchived ?? false,
      isPinned: data.isPinned ?? false,
      isMuted: data.isMuted ?? false,
      unseenCount: 0,
      otherReadAt: 0,
      participants: data.participants ?? {},
      otherUser: {} as PublicUserSummary,
      typingUsers: data.typingUsers ?? [],
    } as Match;
  }

  async updateLastMessage(matchId: string, preview: string, kind: string, senderId: string): Promise<void> {
    await db.collection(COLLECTIONS.matches).doc(matchId).update({
      lastMessagePreview: preview,
      lastMessageKind: kind,
      lastMessageSenderId: senderId,
      lastMessageAt: serverTimestamp(),
    });
  }

  async markRead(matchId: string, uid: string): Promise<void> {
    await db
      .collection(COLLECTIONS.matches)
      .doc(matchId)
      .set(
        {
          [`participants.${uid}`]: { lastReadAt: Date.now(), unseenCount: 0 },
        },
        { merge: true },
      );
  }

  async markUnseen(matchId: string, uid: string, count: number): Promise<void> {
    await db
      .collection(COLLECTIONS.matches)
      .doc(matchId)
      .set(
        {
          [`participants.${uid}.unseenCount`]: count,
        },
        { merge: true },
      );
  }

  async toggleArchive(matchId: string, archived: boolean): Promise<void> {
    await db.collection(COLLECTIONS.matches).doc(matchId).update({ isArchived: archived });
  }

  async togglePin(matchId: string, pinned: boolean): Promise<void> {
    await db.collection(COLLECTIONS.matches).doc(matchId).update({ isPinned: pinned });
  }

  async toggleMute(matchId: string, muted: boolean): Promise<void> {
    await db.collection(COLLECTIONS.matches).doc(matchId).update({ isMuted: muted });
  }
}

function toMillis(v: any): number {
  if (!v) return 0;
  if (v.toMillis) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

export const matchService = new MatchService();
