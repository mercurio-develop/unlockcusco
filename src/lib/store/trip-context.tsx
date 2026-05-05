"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';
import type { Business } from "@prisma/client";
import type { UniversalTrip, TimelineEvent, TripDay } from '@/lib/types/trip';

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
  removeWaypoint: (index: number) => void;
  updateEvent: (dayNumber: number, eventId: string, updates: Partial<TimelineEvent>) => void;
  insertWaypoint: (service: Business) => boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  travelVibe: string | null;
  setTravelVibe: (vibe: string | null) => void;
  travelIntensity: number | null;
  setTravelIntensity: (intensity: number | null) => void;
  isWorkspaceCollapsed: boolean;
  setIsWorkspaceCollapsed: (collapsed: boolean) => void;
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [travelVibe, setTravelVibe] = useState<string | null>(null);
  const [travelIntensity, setTravelIntensity] = useState<number | null>(null);
  const [isWorkspaceCollapsed, setIsWorkspaceCollapsed] = useState(false);

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
            events: [...day.events, event].sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"))
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

  const removeWaypoint = useCallback((index: number) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      const newWaypoints = [...prev.waypoints];
      newWaypoints.splice(index, 1);
      
      const newTransitEdges = [...prev.transitEdges];
      // Remove the edge leading to this waypoint
      newTransitEdges.splice(index, 1);
      
      // If there's a next edge, we should ideally update its fromLocation
      // but for now let's just keep it simple and see if the UI handles it
      if (newTransitEdges[index]) {
          const prevLoc = index === 0 ? prev.startAnchor.locationStr : newWaypoints[index-1].locationStr;
          newTransitEdges[index] = {
              ...newTransitEdges[index],
              fromLocation: prevLoc
          };
      }

      return {
        ...prev,
        waypoints: newWaypoints,
        transitEdges: newTransitEdges
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
              .sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"))
          };
        })
      };
    });
  }, []);

  const insertWaypoint = useCallback((service: Business): boolean => {
    const dayNum = activeDayNumber || 1;
    const isTransport = service.category === 'TRANSPORT';
    const isStay = service.category === 'LODGING' || service.category === 'STAYS';
    
    // We build the object incrementally to satisfy the discriminated union
    let newEvent: TimelineEvent;
    
    if (isTransport) {
      newEvent = {
        id: crypto.randomUUID(),
        type: 'TRANSPORT',
        method: 'CAR', // Default
        from: 'Cusco', // Default placeholder
        to: service.name,
        startTime: '10:00',
        title: service.name,
        service: service
      };
    } else if (isStay) {
      newEvent = {
        id: crypto.randomUUID(),
        type: 'STAY',
        startTime: '10:00',
        title: service.name,
        lat: service.lat || undefined,
        lng: service.lng || undefined,
        service: service
      };
    } else {
      newEvent = {
        id: crypto.randomUUID(),
        type: 'EXPERIENCE',
        startTime: '10:00',
        title: service.name,
        lat: service.lat || undefined,
        lng: service.lng || undefined,
        service: service
      };
    }

    let isNewTrip = false;

    if (panelMode === 'itinerary' || panelMode === 'builder' || activeItinerary || currentTrip) {
        if (activeItinerary) {
            const newWp = {
                id: newEvent.id,
                category: service.category,
                title: service.name,
                locationStr: service.name,
                durationMins: 120,
                priceUsd: 0,
                lat: service.lat || undefined,
                lng: service.lng || undefined,
                rating: service.rating || undefined
            };
            setActiveItinerary({
                ...activeItinerary,
                waypoints: [...activeItinerary.waypoints, newWp],
                totalCost: (activeItinerary.totalCost || 0) + 0
            });
        }
        if (currentTrip) {
            addEvent(dayNum, newEvent);
        }
        setPanelMode('itinerary');
    } else {
        isNewTrip = true;
        
        const startLocName = service.locationSlug 
            ? service.locationSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
            : service.name;

        const newPlan: OptimizedPlan = {
            title: `Trip to ${service.name}`,
            totalCost: 0,
            startAnchor: {
                title: startLocName,
                locationStr: startLocName,
                time: "09:00",
                type: 'GENERIC_TOWN',
                lat: service.lat || undefined,
                lng: service.lng || undefined
            },
            endAnchor: {
                title: "To Be Decided",
                locationStr: "To Be Decided",
                time: "18:00",
                type: 'GENERIC_TOWN',
            },
            waypoints: [
                {
                    id: newEvent.id,
                    category: service.category,
                    title: service.name,
                    locationStr: service.name,
                    durationMins: 120,
                    priceUsd: 0,
                    lat: service.lat || undefined,
                    lng: service.lng || undefined,
                    rating: service.rating || undefined
                }
            ],
            transitEdges: [],
            needsAccommodationUpsell: false
        };

        const newTrip: UniversalTrip = {
            title: `Trip to ${service.name}`,
            startDate: new Date(),
            endDate: new Date(),
            paxCount: 1,
            status: 'DRAFT',
            days: [{
                dayNumber: 1,
                date: new Date(),
                startAnchor: {
                  title: startLocName,
                  time: "09:00",
                  lat: service.lat || undefined,
                  lng: service.lng || undefined
                },
                events: [newEvent]
            }]
        };

        setActiveItinerary(newPlan);
        setCurrentTrip(newTrip);
        setActiveDayNumber(1);
        setPanelMode('itinerary');
    }

    return isNewTrip;
  }, [activeDayNumber, addEvent, activeItinerary, currentTrip, panelMode]);

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
      removeWaypoint,
      updateEvent,
      insertWaypoint,
      isChatOpen,
      setIsChatOpen,
      travelVibe,
      setTravelVibe,
      travelIntensity,
      setTravelIntensity,
      isWorkspaceCollapsed,
      setIsWorkspaceCollapsed
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
