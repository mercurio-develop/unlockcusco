import { create } from "zustand";

interface SelectionState {
  selectedId: string | null;
  setSelectedId: (v: string | null) => void;
  exchangeTargetId: string | null;
  setExchangeTargetId: (v: string | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedId: null,
  setSelectedId: (v) => set({ selectedId: v }),
  exchangeTargetId: null,
  setExchangeTargetId: (v) => set({ exchangeTargetId: v }),
}));
