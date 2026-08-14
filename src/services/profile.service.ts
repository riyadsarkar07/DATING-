import { UserProfile } from '../types/user';
import { userService } from './user.service';
import { uploadImage, uploadVideoIntro, deleteFile } from '../firebase/storage';
import { serverTimestamp } from '../firebase/firestore';
import { logEvent } from '../firebase/analytics';

class ProfileService {
  async saveCompletedProfile(profile: UserProfile): Promise<void> {
    const data: any = {
      displayName: profile.displayName,
      photos: profile.photos,
      photoMeta: profile.photoMeta,
      videoIntro: profile.videoIntro,
      dob: new Date(profile.dob),
      age: profile.age,
      gender: profile.gender,
      interestedIn: profile.interestedIn,
      country: profile.country,
      city: profile.city,
      bio: profile.bio,
      height: profile.height,
      religion: profile.religion,
      education: profile.education,
      occupation: profile.occupation,
      languages: profile.languages,
      relationshipGoal: profile.relationshipGoal,
      smoking: profile.smoking,
      drinking: profile.drinking,
      pets: profile.pets,
      hobbies: profile.hobbies,
      instagram: profile.instagram,
      spotify: profile.spotify,
      setupComplete: true,
      profileUpdatedAt: serverTimestamp(),
    };
    await userService.upsert(profile.uid, data);
    if (profile.location) {
      await userService.updateLocation(profile.uid, profile.location);
    }
    logEvent('profile_completed', { user_id: profile.uid });
  }

  async uploadPhoto(uid: string, uri: string): Promise<{ url: string }> {
    const url = await uploadImage(uid, uri);
    return { url };
  }

  async uploadVideo(uid: string, uri: string): Promise<{ url: string }> {
    const url = await uploadVideoIntro(uid, uri);
    return { url };
  }

  async removePhoto(uid: string, url: string, photos: string[]): Promise<string[]> {
    const next = photos.filter((p) => p !== url);
    await userService.upsert(uid, { photos: next });
    deleteFile(url);
    return next;
  }

  async updateBasicInfo(uid: string, patch: Partial<UserProfile>): Promise<void> {
    await this.writePatch(uid, patch);
  }

  async updateProfile(uid: string, patch: Partial<UserProfile>): Promise<void> {
    await this.writePatch(uid, patch, true);
  }

  /** Writes a profile patch. Precise `location` is routed to the private doc;
   * everything else goes to the public doc. */
  private async writePatch(uid: string, patch: Partial<UserProfile>, withUpdatedAt = false): Promise<void> {
    if (patch.location) {
      await userService.updateLocation(uid, patch.location);
    }
    const { location: _ignored, ...rest } = patch;
    if (withUpdatedAt) {
      await userService.upsert(uid, { ...this.toStorable(rest), profileUpdatedAt: serverTimestamp() });
    } else {
      await userService.upsert(uid, this.toStorable(rest));
    }
  }

  private toStorable(patch: Partial<UserProfile>): Record<string, unknown> {
    const out: Record<string, unknown> = { ...patch } as any;
    if ('dob' in patch && patch.dob) out.dob = new Date(patch.dob);
    return out;
  }

  async completionPercent(profile: UserProfile | null): Promise<number> {
    if (!profile) return 0;
    let points = 0;
    const total = 24;
    if (profile.photos.length >= 2) points += 4;
    else if (profile.photos.length === 1) points += 2;
    if (profile.videoIntro) points += 2;
    if (profile.displayName) points += 1;
    if (profile.dob && profile.age) points += 2;
    if (profile.gender) points += 1;
    if (profile.interestedIn) points += 1;
    if (profile.country) points += 1;
    if (profile.city) points += 1;
    if (profile.bio.length >= 20) points += 3;
    if (profile.height) points += 1;
    if (profile.religion) points += 1;
    if (profile.education) points += 1;
    if (profile.occupation) points += 1;
    if (profile.languages.length > 0) points += 2;
    if (profile.relationshipGoal) points += 1;
    if (profile.smoking) points += 1;
    if (profile.drinking) points += 1;
    if (profile.pets.length > 0) points += 1;
    if (profile.hobbies.length > 0) points += 2;
    if (profile.instagram) points += 1;
    if (profile.spotify) points += 1;
    return Math.min(100, Math.round((points / total) * 100));
  }
}

export const profileService = new ProfileService();
