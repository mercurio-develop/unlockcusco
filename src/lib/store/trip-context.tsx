"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';
import type { Business } from "@prisma/client";
import { usePreferences } from './preferences-context';

export type PanelMode = "discover" | "itinerary";

interface TripContextType {
  activeItinerary: OptimizedPlan | null;
  setActiveItinerary: (i: OptimizedPlan | null) => void;
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  aiPromptToTrigger: string | null;
  setAiPromptToTrigger: (prompt: string | null) => void;
  setStartAnchorLocation: (lat: number, lng: number, title?: string) => void;
  updateEndAnchorLocation: (lat: number, lng: number, title?: string) => void;
  insertWaypoint: (service: Business) => boolean;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const { setIsChatOpen } = usePreferences();
  const [activeItinerary, setActiveItinerary] = useState<OptimizedPlan | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("discover");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiPromptToTrigger, setAiPromptToTrigger] = useState<string | null>(null);

  const setStartAnchorLocation = useCallback((lat: number, lng: number, title: string = "Current Location") => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      return {
        ...prev,
        startAnchor: {
          ...prev.startAnchor,
          lat,
          lng,
          locationStr: title,
          title: title
        }
      };
    });
  }, []);

  const updateEndAnchorLocation = useCallback((lat: number, lng: number, title: string = "Custom End Location") => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      return {
        ...prev,
        endAnchor: {
          ...prev.endAnchor,
          lat,
          lng,
          locationStr: title,
          title: title
        }
      };
    });
  }, []);

  const insertWaypoint = useCallback((service: Business): boolean => {
    // Triggers the AI to add the stop
    const bName = service.name || "this location";
    setAiPromptToTrigger(`[INTERNAL] User added ${bName} to their day. Acknowledge this and ask if they need help adjusting their transport stops.`);
    setIsChatOpen(true);
    setPanelMode('itinerary');
    return false;
  }, [setIsChatOpen]);

  const value = React.useMemo(() => ({
      activeItinerary,
      setActiveItinerary,
      panelMode,
      setPanelMode,
      selectedId,
      setSelectedId,
      aiPromptToTrigger,
      setAiPromptToTrigger,
      setStartAnchorLocation,
      updateEndAnchorLocation,
      insertWaypoint,
  }), [
      activeItinerary, panelMode, selectedId, aiPromptToTrigger,
      setStartAnchorLocation, updateEndAnchorLocation, insertWaypoint
  ]);

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip(): TripContextType {
  const trip = useContext(TripContext);

  if (trip === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }

  return trip;
}