import { userService } from './user.service';
import { PublicUserSummary, UserProfile, GeoPoint } from '../types/user';
import { DiscoverFilter, DiscoveryCandidate, DEFAULT_FILTERS } from '../types/filters';
import { haversineKm } from '../core/utils/distance';
import { swipeService } from './swipe.service';
import db, { COLLECTIONS } from '../firebase/firestore';
import { DiscoverSort } from '../types/enums';

class DiscoveryService {
  async fetchCandidates(
    myProfile: UserProfile,
    filter: DiscoverFilter,
    excludeUids: string[],
    limit = 30,
  ): Promise<DiscoveryCandidate[]> {
    const candidates = await userService.getAllCandidates([...excludeUids, myProfile.uid], 120);
    const myLocation = myProfile.location;

    const filtered = candidates.filter((c) => this.matchesFilter(c, filter, myProfile));
    const sorted = this.sortBy(filtered, filter.sortBy, myProfile);

    const likedByMe = await swipeService.getSwipedUids(myProfile.uid, ['like', 'super_like']);
    const likesYouMap = await this.getLikesYouMap(myProfile.uid);

    return sorted.slice(0, limit).map((c) => {
      const distanceKm = myLocation ? this.estimateDistance(c, myLocation) : null;
      const mutualInterests = this.mutualInterests(c, myProfile);
      return {
        ...c,
        distanceKm,
        mutualInterests,
        matchScore: this.matchScore(c, myProfile, mutualInterests, distanceKm),
        likesYou: !!likesYouMap[c.uid],
        matched: likedByMe.includes(c.uid),
      };
    });
  }

  async getLikesYouMap(uid: string): Promise<Record<string, boolean>> {
    const snap = await db
      .collection(COLLECTIONS.swipes)
      .where('targetUid', '==', uid)
      .where('direction', 'in', ['like', 'super_like'])
      .limit(200)
      .get();
    const map: Record<string, boolean> = {};
    snap.forEach((d) => {
      map[d.data().userId] = true;
    });
    return map;
  }

  private estimateDistance(c: PublicUserSummary, myLocation: GeoPoint): number | null {
    const loc = (c as any).location as GeoPoint | null;
    if (!loc) return null;
    return haversineKm(myLocation, loc);
  }

  private matchesFilter(c: PublicUserSummary, filter: DiscoverFilter, my: UserProfile): boolean {
    if (c.age < filter.minAge || c.age > filter.maxAge) return false;
    if (filter.gender && c.gender !== filter.gender) return false;
    if (filter.interestedIn && !this.compatibleInterests(c, filter.interestedIn)) return false;
    if (filter.religion && c.religion !== filter.religion) return false;
    if (filter.education && c.education !== filter.education) return false;
    if (filter.country && c.country !== filter.country) return false;
    if (filter.language && !c.languages.includes(filter.language)) return false;
    if (filter.verifiedOnly && !c.verified) return false;
    if (filter.premiumOnly && !c.premium) return false;
    if (filter.maxDistanceKm < 9999) {
      const loc = (c as any).location as GeoPoint | null;
      if (my.location && loc) {
        const km = haversineKm(my.location, loc);
        if (km > filter.maxDistanceKm) return false;
      }
    }
    const myGoal = my.interestedIn;
    if (!this.compatibleInterests(c, myGoal)) return false;
    return true;
  }

  private compatibleInterests(c: PublicUserSummary, interestedIn: string): boolean {
    if (interestedIn === 'everyone') return true;
    if (interestedIn === 'men') return c.gender === 'male';
    if (interestedIn === 'women') return c.gender === 'female';
    return true;
  }

  private mutualInterests(c: PublicUserSummary, my: UserProfile): string[] {
    const mySet = new Set(my.hobbies.map((h) => h.toLowerCase()));
    return (c.hobbies ?? []).filter((h) => mySet.has(h.toLowerCase()));
  }

  private matchScore(
    c: PublicUserSummary,
    my: UserProfile,
    mutual: string[],
    distanceKm: number | null,
  ): number {
    let score = 50;
    score += mutual.length * 6;
    const langOverlap = (c.languages ?? []).filter((l) => (my.languages ?? []).includes(l)).length;
    score += langOverlap * 4;
    if (c.relationshipGoal && c.relationshipGoal === my.relationshipGoal) score += 8;
    if (c.religion && c.religion === my.religion) score += 4;
    if (c.education && c.education === my.education) score += 3;
    if (c.height && my.height && Math.abs(c.height - my.height) <= 10) score += 2;
    if (distanceKm !== null && distanceKm < 10) score += 8;
    else if (distanceKm !== null && distanceKm < 30) score += 4;
    if (c.premium) score += 2;
    if (c.verified) score += 2;
    return Math.min(100, Math.round(score + (Math.random() * 4 - 2)));
  }

  private sortBy(
    candidates: PublicUserSummary[],
    sort: DiscoverSort,
    my: UserProfile,
  ): PublicUserSummary[] {
    const now = Date.now();
    switch (sort) {
      case 'nearby':
        return [...candidates].sort((a, b) => {
          const da = this.distFor(a, my);
          const db_ = this.distFor(b, my);
          return (da ?? 99999) - (db_ ?? 99999);
        });
      case 'verified':
        return [...candidates].sort((a, b) => Number(b.verified) - Number(a.verified) || b.lastActive - a.lastActive);
      case 'recent':
        return [...candidates].sort((a, b) => b.lastActive - a.lastActive);
      case 'premium':
        return [...candidates].sort((a, b) => Number(b.premium) - Number(a.premium) || b.lastActive - a.lastActive);
      case 'trending':
        return [...candidates].sort((a, b) => {
          const trend = (c: PublicUserSummary) =>
            (c.boostUntil && c.boostUntil > now ? 100 : 0) + Number(c.verified) * 30 + (c.premium ? 20 : 0);
          return trend(b) - trend(a);
        });
      case 'suggested':
      default:
        return [...candidates].sort((a, b) => {
          const mutualA = this.mutualInterests(a, my).length;
          const mutualB = this.mutualInterests(b, my).length;
          return mutualB - mutualA || b.lastActive - a.lastActive;
        });
    }
  }

  private distFor(c: PublicUserSummary, my: UserProfile): number | null {
    const loc = (c as any).location as GeoPoint | null;
    if (!my.location || !loc) return null;
    return haversineKm(my.location, loc);
  }
}

export const discoveryService = new DiscoveryService();
export { DEFAULT_FILTERS };
