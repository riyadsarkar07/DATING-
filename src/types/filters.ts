import { Education, Gender, InterestedIn, DiscoverSort } from './enums';
import { PublicUserSummary } from './user';

export interface DiscoverFilter {
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  gender: Gender | null;
  interestedIn: InterestedIn | null;
  religion: string | null;
  education: Education | null;
  country: string | null;
  language: string | null;
  verifiedOnly: boolean;
  premiumOnly: boolean;
  sortBy: DiscoverSort;
}

export const DEFAULT_FILTERS: DiscoverFilter = {
  minAge: 18,
  maxAge: 45,
  maxDistanceKm: 100,
  gender: null,
  interestedIn: null,
  religion: null,
  education: null,
  country: null,
  language: null,
  verifiedOnly: false,
  premiumOnly: false,
  sortBy: 'suggested',
};

export interface DiscoveryCandidate extends PublicUserSummary {
  matchScore?: number;
  mutualInterests: string[];
  likesYou: boolean;
}
