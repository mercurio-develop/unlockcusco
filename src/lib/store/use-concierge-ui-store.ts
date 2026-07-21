import { create } from "zustand";

interface ConciergeUiState {
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  travelVibe: string | null;
  setTravelVibe: (v: string | null) => void;
  travelIntensity: number | null;
  setTravelIntensity: (v: number | null) => void;
  targetDate: Date;
  setTargetDate: (v: Date) => void;
  conciergeSendMessage: ((msg: { text: string }) => void) | null;
  setConciergeSendMessage: (
    v: ((msg: { text: string }) => void) | null
  ) => void;
}

export const useConciergeUiStore = create<ConciergeUiState>((set) => ({
  isChatOpen: true,
  setIsChatOpen: (v) => set({ isChatOpen: v }),
  travelVibe: null,
  setTravelVibe: (v) => set({ travelVibe: v }),
  travelIntensity: null,
  setTravelIntensity: (v) => set({ travelIntensity: v }),
  targetDate: new Date(),
  setTargetDate: (v) => set({ targetDate: v }),
  conciergeSendMessage: null,
  setConciergeSendMessage: (v) => set({ conciergeSendMessage: v }),
}));
