import { create } from 'zustand';
import { Match, ChatMessage } from '../types/chat';

interface ChatState {
  matches: Match[];
  activeMatchId: string | null;
  messagesByMatch: Record<string, ChatMessage[]>;
  typingByMatch: Record<string, boolean>;
  setMatches: (items: Match[]) => void;
  upsertMatch: (match: Match) => void;
  removeMatch: (id: string) => void;
  setActiveMatch: (id: string | null) => void;
  setMessages: (matchId: string, messages: ChatMessage[]) => void;
  appendMessage: (matchId: string, message: ChatMessage) => void;
  patchMessage: (matchId: string, message: ChatMessage) => void;
  setTyping: (matchId: string, typing: boolean) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  matches: [],
  activeMatchId: null,
  messagesByMatch: {},
  typingByMatch: {},

  setMatches: (items) => set({ matches: items }),

  upsertMatch: (match) =>
    set((state) => {
      const existing = state.matches.find((m) => m.id === match.id);
      if (!existing) return { matches: [match, ...state.matches] };
      return { matches: state.matches.map((m) => (m.id === match.id ? match : m)) };
    }),

  removeMatch: (id) =>
    set((state) => ({ matches: state.matches.filter((m) => m.id !== id) })),

  setActiveMatch: (id) => set({ activeMatchId: id }),

  setMessages: (matchId, messages) =>
    set((state) => ({ messagesByMatch: { ...state.messagesByMatch, [matchId]: messages } })),

  appendMessage: (matchId, message) =>
    set((state) => {
      const current = state.messagesByMatch[matchId] ?? [];
      const exists = current.some((m) => m.id === message.id);
      if (exists) return state;
      return { messagesByMatch: { ...state.messagesByMatch, [matchId]: [...current, message] } };
    }),

  patchMessage: (matchId, message) =>
    set((state) => {
      const current = state.messagesByMatch[matchId] ?? [];
      return {
        messagesByMatch: {
          ...state.messagesByMatch,
          [matchId]: current.map((m) => (m.id === message.id ? message : m)),
        },
      };
    }),

  setTyping: (matchId, typing) =>
    set((state) => ({ typingByMatch: { ...state.typingByMatch, [matchId]: typing } })),

  resetChat: () =>
    set({ matches: [], activeMatchId: null, messagesByMatch: {}, typingByMatch: {} }),
}));
