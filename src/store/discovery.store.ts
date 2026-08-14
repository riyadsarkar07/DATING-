import { create } from 'zustand';
import { UserProfile } from '../types/user';
import { DiscoveryCandidate, DiscoverFilter, DEFAULT_FILTERS } from '../types/filters';
import { discoveryService } from '../services/discovery.service';

interface DiscoveryState {
  candidates: DiscoveryCandidate[];
  loading: boolean;
  seenIds: string[];
  filter: DiscoverFilter;
  setFilter: (filter: DiscoverFilter) => void;
  setCandidates: (items: DiscoveryCandidate[]) => void;
  removeTop: () => void;
  markSeen: (uid: string) => void;
  resetDeck: () => void;
  refresh: (profile: UserProfile) => Promise<void>;
  loadMore: (profile: UserProfile) => Promise<void>;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  candidates: [],
  loading: false,
  seenIds: [],
  filter: DEFAULT_FILTERS,

  setFilter: (filter) => {
    set({ filter, seenIds: [], candidates: [] });
  },

  setCandidates: (items) => set({ candidates: items }),

  removeTop: () => {
    const [top, ...rest] = get().candidates;
    if (!top) return;
    set({ candidates: rest, seenIds: [...get().seenIds, top.uid] });
  },

  markSeen: (uid) => set({ seenIds: [...get().seenIds, uid] }),

  resetDeck: () => set({ candidates: [], seenIds: [], loading: false }),

  refresh: async (profile) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const items = await discoveryService.fetchCandidates(profile, get().filter, get().seenIds);
      set({ candidates: items });
    } finally {
      set({ loading: false });
    }
  },

  loadMore: async (profile) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const items = await discoveryService.fetchCandidates(profile, get().filter, get().seenIds, 15);
      const existing = get().candidates;
      const known = new Set(existing.map((c) => c.uid));
      const fresh = items.filter((c) => !known.has(c.uid));
      set({ candidates: [...existing, ...fresh] });
    } finally {
      set({ loading: false });
    }
  },
}));
