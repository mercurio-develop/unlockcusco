import { create } from 'zustand';
import { Business } from '@prisma/client';

export interface InteractionRecord {
  type: 'view' | 'map_click';
  id: string;
  name?: string;
  timestamp: number;
}

export interface UiState {
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  mobileViewMode: 'list' | 'map';
  setMobileViewMode: (v: 'list' | 'map') => void;
  travelVibe: string | null;
  setTravelVibe: (v: string | null) => void;
  travelIntensity: number | null;
  setTravelIntensity: (v: number | null) => void;
  targetDate: Date;
  setTargetDate: (v: Date) => void;
  conciergeSendMessage: ((msg: { text: string }) => void) | null;
  setConciergeSendMessage: (v: ((msg: { text: string }) => void) | null) => void;
  panelMode: "discover" | "itinerary";
  setPanelMode: (v: "discover" | "itinerary") => void;
  selectedId: string | null;
  setSelectedId: (v: string | null) => void;
  exchangeTargetId: string | null;
  setExchangeTargetId: (v: string | null) => void;
  isExchangingStart: boolean;
  setIsExchangingStart: (v: boolean) => void;
  isExchangingEnd: boolean;
  setIsExchangingEnd: (v: boolean) => void;
  isAuthRoute?: boolean; // Added to match possible usage if needed, though not in original
  isAddingStop: boolean;
  setIsAddingStop: (v: boolean) => void;
  mapClickMode: 'start' | 'end' | null;
  setMapClickMode: (v: 'start' | 'end' | null) => void;
  mapSearchResults: Business[] | null;
  setMapSearchResults: (v: Business[] | null) => void;
  aiPromptToTrigger: string | null;
  setAiPromptToTrigger: (v: string | null) => void;
  interactionHistory: InteractionRecord[];
  addInteraction: (record: Omit<InteractionRecord, 'timestamp'>) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isChatOpen: true,
  setIsChatOpen: (v) => set({ isChatOpen: v }),
  mobileViewMode: 'list',
  setMobileViewMode: (v) => set({ mobileViewMode: v }),
  travelVibe: null,
  setTravelVibe: (v) => set({ travelVibe: v }),
  travelIntensity: null,
  setTravelIntensity: (v) => set({ travelIntensity: v }),
  targetDate: new Date(),
  setTargetDate: (v) => set({ targetDate: v }),
  conciergeSendMessage: null,
  setConciergeSendMessage: (v) => set({ conciergeSendMessage: v }),
  panelMode: 'discover',
  setPanelMode: (v) => set({ panelMode: v }),
  selectedId: null,
  setSelectedId: (v) => set({ selectedId: v }),
  exchangeTargetId: null,
  setExchangeTargetId: (v) => set({ exchangeTargetId: v }),
  isExchangingStart: false,
  setIsExchangingStart: (v) => set({ isExchangingStart: v }),
  isExchangingEnd: false,
  setIsExchangingEnd: (v) => set({ isExchangingEnd: v }),
  isAddingStop: false,
  setIsAddingStop: (v) => set({ isAddingStop: v }),
  mapClickMode: null,
  setMapClickMode: (v) => set({ mapClickMode: v }),
  mapSearchResults: null,
  setMapSearchResults: (v) => set({ mapSearchResults: v }),
  aiPromptToTrigger: null,
  setAiPromptToTrigger: (v) => set({ aiPromptToTrigger: v }),
  interactionHistory: [],
  addInteraction: (record) => set((state) => {
    const newRecord = { ...record, timestamp: Date.now() };
    const history = [newRecord, ...state.interactionHistory].slice(0, 10);
    return { interactionHistory: history };
  }),
}));
