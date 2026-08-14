import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';
import { UserProfile, PublicUserSummary, GeoPoint } from '../types/user';
import { callFunction } from '../firebase/functions';

const usersRef = () => db.collection(COLLECTIONS.users);

// Path: users/{uid}/private/profile — owner/admin-only PII doc
const privateProfileRef = (uid: string) =>
  db.collection(COLLECTIONS.users).doc(uid).collection('private').doc('profile');

interface InitUserParams {
  email: string;
  displayName: string;
  phone?: string | null;
}

class UserService {
  async initializeUser(uid: string, params: InitUserParams): Promise<void> {
    // Public doc: discover/matches/chat/profile data only. PII + privileged
    // badges live in the private doc or are written by Cloud Functions.
    await db.collection(COLLECTIONS.users).doc(uid).set({
      uid,
      displayName: params.displayName,
      photos: [],
      photoMeta: [],
      videoIntro: null,
      dob: null,
      age: null,
      gender: null,
      interestedIn: null,
      country: '',
      city: '',
      bio: '',
      height: null,
      religion: '',
      education: '',
      occupation: '',
      languages: [],
      relationshipGoal: '',
      smoking: '',
      drinking: '',
      pets: [],
      hobbies: [],
      instagram: '',
      spotify: '',
      online: true,
      lastActive: serverTimestamp(),
      setupComplete: false,
      createdAt: serverTimestamp(),
      blockedUsers: [],
      deleted: false,
    });

    await privateProfileRef(uid).set({
      email: params.email,
      phone: params.phone ?? null,
      fcmToken: null,
      location: null,
    });
  }

  async getProfile(uid: string): Promise<UserProfile | null> {
    const doc = await usersRef().doc(uid).get();
    if (!doc.exists) return null;
    const data = doc.data() as any;
    if (data.deleted) return null;
    return this.mapToProfile(uid, data);
  }

  async getPrivateProfile(uid: string): Promise<{
    email: string;
    phone: string | null;
    fcmToken: string | null;
    location: GeoPoint | null;
    blockedBy: string[];
    banned: boolean;
  } | null> {
    const doc = await privateProfileRef(uid).get();
    if (!doc.exists) return null;
    const data = doc.data() as any;
    return {
      email: data.email ?? '',
      phone: data.phone ?? null,
      fcmToken: data.fcmToken ?? null,
      location: data.location ? { latitude: data.location.latitude, longitude: data.location.longitude } : null,
      blockedBy: data.blockedBy ?? [],
      banned: data.banned ?? false,
    };
  }

  /**
   * Owner-only profile view: public fields merged with the owner's private
   * PII (email/phone/FCM/blockedBy). Never used for other users — the private
   * doc is only readable by its owner/admin, so this only works for self.
   */
  async getOwnProfile(uid: string): Promise<UserProfile | null> {
    const profile = await this.getProfile(uid);
    if (!profile) return null;
    const priv = await this.getPrivateProfile(uid);
    if (priv) {
      profile.email = priv.email;
      profile.phone = priv.phone;
      profile.fcmToken = priv.fcmToken;
      profile.blockedBy = priv.blockedBy;
    }
    return profile;
  }

  async watchOwnProfile(uid: string, cb: (profile: UserProfile | null) => void): Promise<() => void> {
    return usersRef().doc(uid).onSnapshot(async (doc) => {
      if (!doc.exists) return cb(null);
      const profile = this.mapToProfile(uid, doc.data() as any);
      const priv = await this.getPrivateProfile(uid);
      if (priv) {
        profile.email = priv.email;
        profile.phone = priv.phone;
        profile.fcmToken = priv.fcmToken;
        profile.blockedBy = priv.blockedBy;
      }
      cb(profile);
    });
  }

  async watchProfile(uid: string, cb: (profile: UserProfile | null) => void): Promise<() => void> {
    return usersRef().doc(uid).onSnapshot((doc) => {
      if (!doc.exists) return cb(null);
      cb(this.mapToProfile(uid, doc.data() as any));
    });
  }

  async upsert(uid: string, data: Partial<UserProfile> & Record<string, unknown>): Promise<void> {
    await usersRef().doc(uid).set(data, { merge: true });
  }

  async getPublicUsers(uids: string[]): Promise<PublicUserSummary[]> {
    if (uids.length === 0) return [];
    const chunks: string[][] = [];
    for (let i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));
    const results: PublicUserSummary[] = [];
    for (const chunk of chunks) {
      const snap = await usersRef().where('uid', 'in', chunk).limit(10).get();
      snap.forEach((d) => {
        const summary = this.mapToSummary(d.data() as any);
        if (summary) results.push(summary);
      });
    }
    return results;
  }

  async getAllCandidates(excludeUids: string[], limit = 50): Promise<PublicUserSummary[]> {
    const blocked = excludeUids;
    let snapshot;
    try {
      snapshot = await usersRef()
        .where('setupComplete', '==', true)
        .where('deleted', '==', false)
        .limit(limit)
        .get();
    } catch {
      snapshot = await usersRef().limit(limit).get();
    }
    const result: PublicUserSummary[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as any;
      if (blocked.includes(data.uid)) return;
      if (data.deleted) return;
      const summary = this.mapToSummary(data);
      if (summary) result.push(summary);
    });
    return result;
  }

  async searchUsers(searchTerm: string, excludeUids: string[] = []): Promise<PublicUserSummary[]> {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    const snapshot = await usersRef()
      .where('setupComplete', '==', true)
      .limit(50)
      .get();
    const result: PublicUserSummary[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as any;
      if (excludeUids.includes(data.uid) || data.deleted) return;
      const name = (data.displayName || '').toLowerCase();
      const city = (data.city || '').toLowerCase();
      if (name.includes(term) || city.includes(term)) {
        const summary = this.mapToSummary(data);
        if (summary) result.push(summary);
      }
    });
    return result;
  }

  async setOnline(uid: string, online: boolean): Promise<void> {
    await usersRef().doc(uid).set({ online, lastActive: serverTimestamp() }, { merge: true });
  }

  /** FCM tokens are PII — stored only in the owner/admin private profile doc. */
  async updateFcmToken(uid: string, token: string): Promise<void> {
    await privateProfileRef(uid).set({ fcmToken: token }, { merge: true });
  }

  /**
   * Precise location is stored in the private doc (owner-only). A server
   * trigger (onPrivateProfileWrite) mirrors a coarse (~11 km) copy to the
   * public doc so discovery can estimate distances without exposing precise
   * coordinates. Clients can never write `location` on the public doc.
   */
  async updateLocation(uid: string, location: GeoPoint): Promise<void> {
    await privateProfileRef(uid).set({ location }, { merge: true });
  }

  async blockUser(uid: string, targetUid: string): Promise<void> {
    await callFunction('blockUser', { targetUid });
  }

  async unblockUser(uid: string, targetUid: string): Promise<void> {
    await callFunction('unblockUser', { targetUid });
  }

  async getBlockedUsers(uid: string): Promise<PublicUserSummary[]> {
    const doc = await usersRef().doc(uid).get();
    if (!doc.exists) return [];
    const data = doc.data() as any;
    const blocked = data.blockedUsers ?? [];
    return this.getPublicUsers(blocked);
  }

  async deleteAccount(uid: string): Promise<void> {
    await callFunction('deleteAccount');
  }

  mapToProfile(uid: string, data: any): UserProfile {
    const ts = (v: any): number => (v?.toMillis ? v.toMillis() : typeof v === 'number' ? v : Date.now());
    return {
      uid,
      email: data.email ?? '',
      phone: data.phone ?? null,
      displayName: data.displayName ?? '',
      photos: data.photos ?? [],
      photoMeta: (data.photoMeta ?? []).map((p: any) => ({
        url: p.url,
        order: p.order ?? 0,
        uploadedAt: ts(p.uploadedAt),
      })),
      videoIntro: data.videoIntro ?? null,
      dob: ts(data.dob),
      age: data.age ?? 0,
      gender: data.gender ?? 'non_binary',
      interestedIn: data.interestedIn ?? 'everyone',
      country: data.country ?? '',
      city: data.city ?? '',
      bio: data.bio ?? '',
      height: data.height ?? null,
      religion: data.religion ?? '',
      education: data.education ?? '',
      occupation: data.occupation ?? '',
      languages: data.languages ?? [],
      relationshipGoal: data.relationshipGoal ?? '',
      smoking: data.smoking ?? '',
      drinking: data.drinking ?? '',
      pets: data.pets ?? [],
      hobbies: data.hobbies ?? [],
      instagram: data.instagram ?? '',
      spotify: data.spotify ?? '',
      location: data.location ? { latitude: data.location.latitude, longitude: data.location.longitude } : null,
      online: data.online ?? false,
      lastActive: ts(data.lastActive),
      verified: data.verified ?? false,
      premium: data.premium ?? false,
      premiumTier: data.premiumTier ?? null,
      boostUntil: data.boostUntil ? ts(data.boostUntil) : null,
      setupComplete: data.setupComplete ?? false,
      createdAt: ts(data.createdAt),
      fcmToken: data.fcmToken ?? null,
      blockedUsers: data.blockedUsers ?? [],
      blockedBy: data.blockedBy ?? [],
      deleted: data.deleted ?? false,
      reportedCount: data.reportedCount ?? 0,
    };
  }

  mapToSummary(data: any): PublicUserSummary | null {
    if (!data || data.deleted || !data.setupComplete) return null;
    const profile = this.mapToProfile(data.uid, data);
    return {
      uid: profile.uid,
      displayName: profile.displayName,
      photos: profile.photos,
      age: profile.age,
      gender: profile.gender,
      occupation: profile.occupation,
      bio: profile.bio,
      distanceKm: null,
      online: profile.online,
      lastActive: profile.lastActive,
      verified: profile.verified,
      premium: profile.premium,
      premiumTier: profile.premiumTier,
      boostUntil: profile.boostUntil,
      hobbies: profile.hobbies,
      languages: profile.languages,
      religion: profile.religion,
      education: profile.education,
      relationshipGoal: profile.relationshipGoal,
      height: profile.height,
      city: profile.city,
      country: profile.country,
      videoIntro: profile.videoIntro,
      instagram: profile.instagram,
      spotify: profile.spotify,
    };
  }
}

export const userService = new UserService();
