import {
  Education,
  Gender,
  InterestedIn,
  PremiumTier,
  RelationshipGoal,
  Smoking,
  Drinking,
} from './enums';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface PhotoMeta {
  url: string;
  order: number;
  uploadedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  phone: string | null;
  displayName: string;
  photos: string[];
  photoMeta: PhotoMeta[];
  videoIntro: string | null;
  dob: number;
  age: number;
  gender: Gender;
  interestedIn: InterestedIn;
  country: string;
  city: string;
  bio: string;
  height: number | null;
  religion: string;
  education: Education | '';
  occupation: string;
  languages: string[];
  relationshipGoal: RelationshipGoal | '';
  smoking: Smoking | '';
  drinking: Drinking | '';
  pets: string[];
  hobbies: string[];
  instagram: string;
  spotify: string;

  location: GeoPoint | null;
  online: boolean;
  lastActive: number;
  verified: boolean;
  premium: boolean;
  premiumTier: PremiumTier | null;
  boostUntil: number | null;
  setupComplete: boolean;
  createdAt: number;
  fcmToken: string | null;
  blockedUsers: string[];
  blockedBy: string[];
  deleted: boolean;
  reportedCount: number;
}

export interface PublicUserSummary {
  uid: string;
  displayName: string;
  photos: string[];
  age: number;
  gender: Gender;
  occupation: string;
  bio: string;
  distanceKm: number | null;
  online: boolean;
  lastActive: number;
  verified: boolean;
  premium: boolean;
  premiumTier: PremiumTier | null;
  boostUntil: number | null;
  hobbies: string[];
  languages: string[];
  religion: string;
  education: Education | '';
  relationshipGoal: RelationshipGoal | '';
  height: number | null;
  city: string;
  country: string;
  videoIntro: string | null;
  instagram: string;
  spotify: string;
  matched?: boolean;
}

export interface CreateAccountParams {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResult {
  user: { uid: string; emailVerified: boolean; email: string | null; displayName: string | null };
}
