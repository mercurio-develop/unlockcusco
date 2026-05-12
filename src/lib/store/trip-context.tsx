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
  exchangeTargetId: string | null;
  setExchangeTargetId: (id: string | null) => void;
  aiPromptToTrigger: string | null;
  setAiPromptToTrigger: (prompt: string | null) => void;
  setStartAnchorLocation: (lat: number, lng: number, title?: string) => void;
  updateEndAnchorLocation: (lat: number, lng: number, title?: string) => void;
  insertWaypoint: (service: Business) => boolean;
  swapWaypoint: (targetId: string, newService: Business) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const { setIsChatOpen } = usePreferences();
  const [activeItinerary, setActiveItinerary] = useState<OptimizedPlan | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("discover");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exchangeTargetId, setExchangeTargetId] = useState<string | null>(null);
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
    setActiveItinerary(prev => {
      const newWaypoint = {
        id: service.id,
        category: service.category || 'General',
        title: service.name,
        locationStr: service.name,
        lat: service.lat || undefined,
        lng: service.lng || undefined,
        rating: service.rating || undefined,
        service: service
      };

      if (!prev) {
        return {
          title: "Today's Plan",
          startAnchor: {
            title: 'Current Location', locationStr: 'Current Location',
            type: 'GENERIC_TOWN' as const,
          },
          endAnchor: {
            title: 'Destination', locationStr: 'Destination',
            type: 'GENERIC_TOWN' as const,
          },
          waypoints: [newWaypoint],
          transitEdges: [],
          needsAccommodationUpsell: false,
          totalCost: 0,
        };
      }

      return {
        ...prev,
        waypoints: [...prev.waypoints, newWaypoint]
      };
    });

    const bName = service.name || "this location";
    setAiPromptToTrigger(`I just added ${bName} to my itinerary.`);
    setIsChatOpen(true);
    setPanelMode('itinerary');
    return true;
  }, [setIsChatOpen]);

  const swapWaypoint = useCallback((targetId: string, newService: Business) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      const updatedWaypoints = prev.waypoints.map(w => 
        w.id === targetId ? {
          ...w,
          id: newService.id,
          category: newService.category || 'General',
          title: newService.name,
          locationStr: newService.name,
          lat: newService.lat || undefined,
          lng: newService.lng || undefined,
          rating: newService.rating || undefined,
          service: newService
        } : w
      );
      return { ...prev, waypoints: updatedWaypoints };
    });
    setExchangeTargetId(null);
    setPanelMode('itinerary');
  }, []);

  const value = React.useMemo(() => ({
      activeItinerary,
      setActiveItinerary,
      panelMode,
      setPanelMode,
      selectedId,
      setSelectedId,
      exchangeTargetId,
      setExchangeTargetId,
      aiPromptToTrigger,
      setAiPromptToTrigger,
      setStartAnchorLocation,
      updateEndAnchorLocation,
      insertWaypoint,
      swapWaypoint,
  }), [
      activeItinerary, panelMode, selectedId, exchangeTargetId, aiPromptToTrigger,
      setStartAnchorLocation, updateEndAnchorLocation, insertWaypoint, swapWaypoint
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