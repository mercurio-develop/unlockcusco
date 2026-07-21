import { create } from "zustand";
import type { Business } from "@prisma/client";
import type { RadarState } from "./store-types";

interface MapUiState {
  mobileViewMode: "list" | "map";
  setMobileViewMode: (v: "list" | "map") => void;
  isExchangingStart: boolean;
  setIsExchangingStart: (v: boolean) => void;
  isExchangingEnd: boolean;
  setIsExchangingEnd: (v: boolean) => void;
  isAddingStop: boolean;
  setIsAddingStop: (v: boolean) => void;
  mapClickMode: "start" | "end" | null;
  setMapClickMode: (v: "start" | "end" | null) => void;
  mapSearchResults: Business[] | null;
  setMapSearchResults: (v: Business[] | null) => void;
  radarState: RadarState | null;
  setRadarState: (v: RadarState | null) => void;
}

export const useMapUiStore = create<MapUiState>((set) => ({
  mobileViewMode: "list",
  setMobileViewMode: (v) => set({ mobileViewMode: v }),
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
  radarState: null,
  setRadarState: (v) => set({ radarState: v }),
}));
