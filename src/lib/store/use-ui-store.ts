/**
 * @deprecated Prefer focused stores: useSelectionStore, useMapUiStore,
 * useConciergeUiStore, usePanelStore, useInteractionStore.
 */
import { useSelectionStore } from "./use-selection-store";
import { useMapUiStore } from "./use-map-ui-store";
import { useConciergeUiStore } from "./use-concierge-ui-store";
import { usePanelStore } from "./use-panel-store";
import { useInteractionStore } from "./use-interaction-store";
import type { InteractionRecord, RadarState } from "./store-types";

export type { InteractionRecord, RadarState };

export interface UiState {
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  mobileViewMode: "list" | "map";
  setMobileViewMode: (v: "list" | "map") => void;
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: (v: { lat: number; lng: number } | null) => void;
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
  isAddingStop: boolean;
  setIsAddingStop: (v: boolean) => void;
  mapClickMode: "start" | "end" | null;
  setMapClickMode: (v: "start" | "end" | null) => void;
  mapSearchResults: import("@prisma/client").Business[] | null;
  setMapSearchResults: (
    v: import("@prisma/client").Business[] | null
  ) => void;
  interactionHistory: InteractionRecord[];
  addInteraction: (record: Omit<InteractionRecord, "timestamp">) => void;
  radarState: RadarState | null;
  setRadarState: (v: RadarState | null) => void;
}

type UiSelector<T> = (state: UiState) => T;

function buildUiState(): UiState {
  const selection = useSelectionStore.getState();
  const mapUi = useMapUiStore.getState();
  const concierge = useConciergeUiStore.getState();
  const panel = usePanelStore.getState();
  const interaction = useInteractionStore.getState();

  return {
    isChatOpen: concierge.isChatOpen,
    setIsChatOpen: concierge.setIsChatOpen,
    mobileViewMode: mapUi.mobileViewMode,
    setMobileViewMode: mapUi.setMobileViewMode,
    userCoords: interaction.userCoords,
    setUserCoords: interaction.setUserCoords,
    travelVibe: concierge.travelVibe,
    setTravelVibe: concierge.setTravelVibe,
    travelIntensity: concierge.travelIntensity,
    setTravelIntensity: concierge.setTravelIntensity,
    targetDate: concierge.targetDate,
    setTargetDate: concierge.setTargetDate,
    conciergeSendMessage: concierge.conciergeSendMessage,
    setConciergeSendMessage: concierge.setConciergeSendMessage,
    panelMode: panel.panelMode,
    setPanelMode: panel.setPanelMode,
    selectedId: selection.selectedId,
    setSelectedId: selection.setSelectedId,
    exchangeTargetId: selection.exchangeTargetId,
    setExchangeTargetId: selection.setExchangeTargetId,
    isExchangingStart: mapUi.isExchangingStart,
    setIsExchangingStart: mapUi.setIsExchangingStart,
    isExchangingEnd: mapUi.isExchangingEnd,
    setIsExchangingEnd: mapUi.setIsExchangingEnd,
    isAddingStop: mapUi.isAddingStop,
    setIsAddingStop: mapUi.setIsAddingStop,
    mapClickMode: mapUi.mapClickMode,
    setMapClickMode: mapUi.setMapClickMode,
    mapSearchResults: mapUi.mapSearchResults,
    setMapSearchResults: mapUi.setMapSearchResults,
    interactionHistory: interaction.interactionHistory,
    addInteraction: interaction.addInteraction,
    radarState: mapUi.radarState,
    setRadarState: mapUi.setRadarState,
  };
}

export function useUiStore<T>(selector: UiSelector<T>): T {
  const selection = useSelectionStore();
  const mapUi = useMapUiStore();
  const concierge = useConciergeUiStore();
  const panel = usePanelStore();
  const interaction = useInteractionStore();

  const state: UiState = {
    isChatOpen: concierge.isChatOpen,
    setIsChatOpen: concierge.setIsChatOpen,
    mobileViewMode: mapUi.mobileViewMode,
    setMobileViewMode: mapUi.setMobileViewMode,
    userCoords: interaction.userCoords,
    setUserCoords: interaction.setUserCoords,
    travelVibe: concierge.travelVibe,
    setTravelVibe: concierge.setTravelVibe,
    travelIntensity: concierge.travelIntensity,
    setTravelIntensity: concierge.setTravelIntensity,
    targetDate: concierge.targetDate,
    setTargetDate: concierge.setTargetDate,
    conciergeSendMessage: concierge.conciergeSendMessage,
    setConciergeSendMessage: concierge.setConciergeSendMessage,
    panelMode: panel.panelMode,
    setPanelMode: panel.setPanelMode,
    selectedId: selection.selectedId,
    setSelectedId: selection.setSelectedId,
    exchangeTargetId: selection.exchangeTargetId,
    setExchangeTargetId: selection.setExchangeTargetId,
    isExchangingStart: mapUi.isExchangingStart,
    setIsExchangingStart: mapUi.setIsExchangingStart,
    isExchangingEnd: mapUi.isExchangingEnd,
    setIsExchangingEnd: mapUi.setIsExchangingEnd,
    isAddingStop: mapUi.isAddingStop,
    setIsAddingStop: mapUi.setIsAddingStop,
    mapClickMode: mapUi.mapClickMode,
    setMapClickMode: mapUi.setMapClickMode,
    mapSearchResults: mapUi.mapSearchResults,
    setMapSearchResults: mapUi.setMapSearchResults,
    interactionHistory: interaction.interactionHistory,
    addInteraction: interaction.addInteraction,
    radarState: mapUi.radarState,
    setRadarState: mapUi.setRadarState,
  };

  return selector(state);
}

useUiStore.getState = buildUiState;
useUiStore.setState = () => {
  throw new Error("useUiStore.setState is deprecated; update focused stores directly.");
};

export {
  useSelectionStore,
  useMapUiStore,
  useConciergeUiStore,
  usePanelStore,
  useInteractionStore,
};
