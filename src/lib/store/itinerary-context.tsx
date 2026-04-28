"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Using the same structure returned by buildChronoRelay
export type RelayPayload = {
  origin: string;
  destination: string;
  food: { name: string; rating: number; distance?: string; whatsapp?: string; lat?: number; lng?: number; id?: string };
  transit: { name: string; driver: string; rating: number; whatsapp?: string; lat?: number; lng?: number; id?: string };
  stay: { name: string; rating: number; lat?: number; lng?: number; id?: string };
  transitCost: number;
  foodCost: number;
  totalCost: number;
  distanceKm: string;
};

type PanelMode = "categories" | "itinerary";

interface ItineraryContextType {
  activeRelay: RelayPayload | null;
  setActiveRelay: (relay: RelayPayload | null) => void;
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;
  swapModeCategory: "food" | "transit" | "stay" | null;
  setSwapModeCategory: (category: "food" | "transit" | "stay" | null) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [activeRelay, setActiveRelay] = useState<RelayPayload | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("categories");
  const [swapModeCategory, setSwapModeCategory] = useState<"food" | "transit" | "stay" | null>(null);

  return (
    <ItineraryContext.Provider value={{
      activeRelay, setActiveRelay,
      panelMode, setPanelMode,
      swapModeCategory, setSwapModeCategory
    }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}
