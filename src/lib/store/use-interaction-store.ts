import { create } from "zustand";
import type { InteractionRecord } from "./store-types";

interface InteractionState {
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: (v: { lat: number; lng: number } | null) => void;
  interactionHistory: InteractionRecord[];
  addInteraction: (record: Omit<InteractionRecord, "timestamp">) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  userCoords: null,
  setUserCoords: (v) => set({ userCoords: v }),
  interactionHistory: [],
  addInteraction: (record) =>
    set((state) => {
      const newRecord = { ...record, timestamp: Date.now() };
      const history = [newRecord, ...state.interactionHistory].slice(0, 10);
      return { interactionHistory: history };
    }),
}));
