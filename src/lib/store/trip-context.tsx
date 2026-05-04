"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';
import type { UniversalTrip, TimelineEvent, TripDay, UniversalService } from '@/lib/types/trip';

type PanelMode = "categories" | "itinerary" | "macro" | "builder";
type ViewState = "wizard" | "workspace" | "checkout";

interface TripContextType {
  activeItinerary: OptimizedPlan | null;
  setActiveItinerary: (i: OptimizedPlan | null) => void;
  macroTrip: any | null;
  setMacroTrip: (trip: any | null) => void;
  currentTrip: UniversalTrip | null;
  setCurrentTrip: (trip: UniversalTrip | null) => void;
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;
  viewState: ViewState;
  setViewState: (state: ViewState) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  activeDayNumber: number | null;
  setActiveDayNumber: (day: number | null) => void;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  leftWidth: number;
  setLeftWidth: (w: number) => void;
  addEvent: (dayNumber: number, event: TimelineEvent) => void;
  removeEvent: (dayNumber: number, eventId: string) => void;
  updateEvent: (dayNumber: number, eventId: string, updates: Partial<TimelineEvent>) => void;
  insertWaypoint: (service: UniversalService) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [activeItinerary, setActiveItinerary] = useState<OptimizedPlan | null>(null);
  const [macroTrip, setMacroTrip] = useState<any | null>(null);
  const [currentTrip, setCurrentTrip] = useState<UniversalTrip | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("categories");
  const [viewState, setViewState] = useState<ViewState>("wizard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDayNumber, setActiveDayNumber] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [leftWidth, setLeftWidth] = useState(40);

  useEffect(() => {
    if (activeItinerary && !currentTrip) {
        const mappedTrip: UniversalTrip = {
            title: activeItinerary.title || "AI Planned Trip",
            startDate: new Date(),
            endDate: new Date(),
            paxCount: 1,
            status: 'DRAFT',
            days: [{
                dayNumber: 1,
                date: new Date(),
                events: activeItinerary.waypoints.map(w => ({
                    id: w.id,
                    type: w.category === 'Stays' ? 'STAY' : 'EXPERIENCE',
                    startTime: "10:00",
                    title: w.title,
                    lat: w.lat,
                    lng: w.lng,
                    priceUsd: w.priceUsd
                }))
            }]
        };
        setCurrentTrip(mappedTrip);
    }
  }, [activeItinerary, currentTrip]);

  const addEvent = useCallback((dayNumber: number, event: TimelineEvent) => {
    setCurrentTrip(prev => {
      if (!prev) return null;
      return {
        ...prev,
        days: prev.days.map(day => {
          if (day.dayNumber !== dayNumber) return day;
          return {
            ...day,
            events: [...day.events, event].sort((a, b) => a.startTime.localeCompare(b.startTime))
          };
        })
      };
    });
  }, []);

  const removeEvent = useCallback((dayNumber: number, eventId: string) => {
    setCurrentTrip(prev => {
      if (!prev) return null;
      return {
        ...prev,
        days: prev.days.map(day => {
          if (day.dayNumber !== dayNumber) return day;
          return {
            ...day,
            events: day.events.filter(e => e.id !== eventId)
          };
        })
      };
    });
  }, []);

  const updateEvent = useCallback((dayNumber: number, eventId: string, updates: Partial<TimelineEvent>) => {
    setCurrentTrip(prev => {
      if (!prev) return null;
      return {
        ...prev,
        days: prev.days.map(day => {
          if (day.dayNumber !== dayNumber) return day;
          return {
            ...day,
            events: day.events.map(e => e.id === eventId ? { ...e, ...updates } as TimelineEvent : e)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
          };
        })
      };
    });
  }, []);

  const insertWaypoint = useCallback((service: UniversalService) => {
    const dayNum = activeDayNumber || 1;
    const newEvent: TimelineEvent = {
        id: crypto.randomUUID(),
        type: service.type === 'TRANSPORT' ? 'TRANSPORT' : (service.category === 'Stays' ? 'STAY' : 'EXPERIENCE'),
        startTime: '10:00',
        title: service.name,
        lat: service.lat,
        lng: service.lng,
        priceUsd: service.basePriceUsd || 15,
        service: service
    };

    if (panelMode === 'builder' || currentTrip) {
        addEvent(dayNum, newEvent);
    }
  }, [activeDayNumber, addEvent, currentTrip, panelMode]);

  return (
    <TripContext.Provider value={{
      activeItinerary,
      setActiveItinerary,
      macroTrip,
      setMacroTrip,
      currentTrip,
      setCurrentTrip,
      panelMode,
      setPanelMode,
      viewState,
      setViewState,
      selectedId,
      setSelectedId,
      activeDayNumber,
      setActiveDayNumber,
      isEditMode,
      setIsEditMode,
      leftWidth,
      setLeftWidth,
      addEvent,
      removeEvent,
      updateEvent,
      insertWaypoint
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
