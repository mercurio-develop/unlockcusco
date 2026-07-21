import { create } from "zustand";

interface PanelState {
  panelMode: "discover" | "itinerary";
  setPanelMode: (v: "discover" | "itinerary") => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  panelMode: "discover",
  setPanelMode: (v) => set({ panelMode: v }),
}));
