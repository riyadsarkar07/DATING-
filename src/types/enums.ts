export type Gender = 'male' | 'female' | 'non_binary';

export type InterestedIn = 'men' | 'women' | 'everyone';

export type RelationshipGoal =
  | 'long_term'
  | 'short_term'
  | 'casual'
  | 'friendship'
  | 'figuring_out';

export type Smoking = 'never' | 'occasionally' | 'socially' | 'regularly';

export type Drinking = 'never' | 'socially' | 'regularly';

export type Education =
  | 'high_school'
  | 'some_college'
  | 'associates'
  | 'bachelors'
  | 'masters'
  | 'phd'
  | 'trade_school'
  | 'other';

export type PremiumTier = 'gold' | 'platinum' | 'diamond';

export type MessageKind = 'text' | 'image' | 'video' | 'voice' | 'emoji' | 'gif' | 'system';

export type NotificationType =
  | 'like'
  | 'super_like'
  | 'match'
  | 'message'
  | 'visitor'
  | 'premium'
  | 'system'
  | 'boost'
  | 'coin';

export type CallType = 'voice' | 'video';

export type CallStatus = 'missed' | 'ended' | 'ongoing';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type SwipeDirection = 'like' | 'super_like' | 'pass';

export type DiscoverSort = 'suggested' | 'trending' | 'nearby' | 'verified' | 'recent' | 'premium';

export type AppLanguage = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

export type AuthStatus = 'unknown' | 'unauthenticated' | 'incomplete-profile' | 'authenticated';
