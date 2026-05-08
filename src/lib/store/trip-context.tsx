"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';
import type { Business } from "@prisma/client";
import type { UniversalTrip, TimelineEvent, TripDay } from '@/lib/types/trip';

import { COORDS_MAP, DEFAULT_COORDS } from "@/lib/constants";

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
  removeWaypoint: (index: number) => void;
  moveWaypoint: (fromIndex: number, toIndex: number) => void;
  swapDriverAlternative: (edgeIndex: number, altIndex: number) => void;
  truncateAfterWaypoint: (index: number) => void;
  setStartAnchorLocation: (lat: number, lng: number) => void;
  aiPromptToTrigger: string | null;
  setAiPromptToTrigger: (prompt: string | null) => void;
  bookingStatus: 'idle' | 'checking_experiences' | 'checking_transport' | 'payment_required' | 'confirmed' | 'failed';
  entityStatuses: Record<string, 'pending' | 'checking' | 'confirmed' | 'unavailable'>;
  startBookingOrchestration: () => Promise<void>;
  resetBooking: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  travelVibe: string | null;
  setTravelVibe: (vibe: string | null) => void;
  travelIntensity: number | null;
  setTravelIntensity: (intensity: number | null) => void;
  isWorkspaceCollapsed: boolean;
  setIsWorkspaceCollapsed: (collapsed: boolean) => void;
  exchangeTargetIndex: number | null;
  setExchangeTargetIndex: (index: number | null) => void;
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
  const [exchangeTargetIndex, setExchangeTargetIndex] = useState<number | null>(null);
  const [aiPromptToTrigger, setAiPromptToTrigger] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'checking_experiences' | 'checking_transport' | 'payment_required' | 'confirmed' | 'failed'>('idle');
  const [entityStatuses, setEntityStatuses] = useState<Record<string, 'pending' | 'checking' | 'confirmed' | 'unavailable'>>({});

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
      
      // Update the edge that now points to the successor
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
        transitEdges: newTransitEdges,
        totalCost: newWaypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newTransitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0)
      };
    });
  }, []);

  const moveWaypoint = useCallback((fromIndex: number, toIndex: number) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      const newWaypoints = [...prev.waypoints];
      const [moved] = newWaypoints.splice(fromIndex, 1);
      newWaypoints.splice(toIndex, 0, moved);

      // Rebuild transit edges for simplicity and consistency
      const nodes = [
        { locationStr: prev.startAnchor.locationStr },
        ...newWaypoints.map(w => ({ locationStr: w.locationStr })),
        { locationStr: prev.endAnchor.locationStr }
      ];

      const newTransitEdges = nodes.slice(0, -1).map((node, i) => {
        const existing = prev.transitEdges.find(e => e.fromLocation === node.locationStr && e.toLocation === nodes[i+1].locationStr);
        if (existing) return existing;
        
        // Fallback edge
        return {
          fromLocation: node.locationStr,
          toLocation: nodes[i+1].locationStr,
          defaultDriver: { name: 'Sacred Valley Transfers', priceUsd: 15 },
          alternativeDrivers: []
        };
      });

      return {
        ...prev,
        waypoints: newWaypoints,
        transitEdges: newTransitEdges,
        totalCost: newWaypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newTransitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0)
      };
    });
  }, []);

  const swapDriverAlternative = useCallback((edgeIndex: number, altIndex: number) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      const newTransitEdges = [...prev.transitEdges];
      const edge = newTransitEdges[edgeIndex];
      if (!edge || !edge.alternativeDrivers) return prev;

      const newAlt = edge.alternativeDrivers[altIndex];
      const oldDefault = edge.defaultDriver;

      const newAlts = [...edge.alternativeDrivers];
      newAlts.splice(altIndex, 1);
      newAlts.push(oldDefault);

      newTransitEdges[edgeIndex] = {
        ...edge,
        defaultDriver: newAlt,
        alternativeDrivers: newAlts
      };

      return {
        ...prev,
        transitEdges: newTransitEdges,
        totalCost: prev.waypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newTransitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0)
      };
    });
  }, []);

  const truncateAfterWaypoint = useCallback((index: number) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      const newWaypoints = prev.waypoints.slice(0, index + 1);
      const newTransitEdges = prev.transitEdges.slice(0, index + 1);
      
      const lastWp = newWaypoints[newWaypoints.length - 1];
      
      return {
        ...prev,
        waypoints: newWaypoints,
        transitEdges: newTransitEdges,
        endAnchor: {
          ...prev.endAnchor,
          title: lastWp.title,
          locationStr: lastWp.locationStr,
          lat: lastWp.lat,
          lng: lastWp.lng
        },
        totalCost: newWaypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newTransitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0)
      };
    });
  }, []);

  const setStartAnchorLocation = useCallback((lat: number, lng: number) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      return {
        ...prev,
        startAnchor: {
          ...prev.startAnchor,
          lat,
          lng,
          locationStr: "My Location"
        }
      };
    });
  }, []);

  const resetBooking = useCallback(() => {
    setBookingStatus('idle');
    setEntityStatuses({});
  }, []);

  const startBookingOrchestration = useCallback(async () => {
    if (!activeItinerary) return;

    setBookingStatus('checking_experiences');
    const initialStatuses: Record<string, 'pending' | 'checking' | 'confirmed' | 'unavailable'> = {};
    activeItinerary.waypoints.forEach(w => {
      initialStatuses[w.id] = 'pending';
    });
    activeItinerary.transitEdges.forEach((e, i) => {
      initialStatuses[`transit-${i}`] = 'pending';
    });
    setEntityStatuses(initialStatuses);

    // Stage A: Checking Experiences
    for (const wp of activeItinerary.waypoints) {
      setEntityStatuses(prev => ({ ...prev, [wp.id]: 'checking' }));
      // Simulate real checking delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEntityStatuses(prev => ({ ...prev, [wp.id]: 'confirmed' }));
    }

    // Stage B: Checking Transport
    setBookingStatus('checking_transport');
    for (let i = 0; i < activeItinerary.transitEdges.length; i++) {
      const edgeId = `transit-${i}`;
      setEntityStatuses(prev => ({ ...prev, [edgeId]: 'checking' }));
      await new Promise(resolve => setTimeout(resolve, 1200));
      setEntityStatuses(prev => ({ ...prev, [edgeId]: 'confirmed' }));
    }

    setBookingStatus('payment_required');
  }, [activeItinerary]);

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
    
    if (exchangeTargetIndex !== null) {
      if (exchangeTargetIndex === -1 && activeItinerary) {
        const startLocName = service.locationSlug 
            ? service.locationSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
            : service.name;
        setActiveItinerary({
          ...activeItinerary,
          startAnchor: {
            ...activeItinerary.startAnchor,
            title: service.name,
            locationStr: startLocName,
            lat: service.lat || undefined,
            lng: service.lng || undefined,
            service: service
          }
        });
        setExchangeTargetIndex(null);
        setPanelMode("itinerary");
        return false;
      }
      if (exchangeTargetIndex === -2 && activeItinerary) {
        const endLocName = service.locationSlug 
            ? service.locationSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
            : service.name;
        setActiveItinerary({
          ...activeItinerary,
          endAnchor: {
            ...activeItinerary.endAnchor,
            title: service.name,
            locationStr: endLocName,
            lat: service.lat || undefined,
            lng: service.lng || undefined,
            service: service
          }
        });
        setExchangeTargetIndex(null);
        setPanelMode("itinerary");
        return false;
      }
      
      if (exchangeTargetIndex >= 0 && activeItinerary) {
        const newWp = {
            id: crypto.randomUUID(),
            category: service.category,
            title: service.name,
            locationStr: service.name,
            durationMins: 120,
            priceUsd: 0,
            lat: service.lat || undefined,
            lng: service.lng || undefined,
            rating: service.rating || undefined,
            service: service
        };
        
        const updatedWaypoints = [...activeItinerary.waypoints];
        updatedWaypoints[exchangeTargetIndex] = newWp;
        
        const updatedTransitEdges = [...activeItinerary.transitEdges];
        if (exchangeTargetIndex < updatedTransitEdges.length) {
             updatedTransitEdges[exchangeTargetIndex].toLocation = service.name;
        }
        if (exchangeTargetIndex + 1 < updatedTransitEdges.length) {
             updatedTransitEdges[exchangeTargetIndex + 1].fromLocation = service.name;
        }
        
        setActiveItinerary({
            ...activeItinerary,
            waypoints: updatedWaypoints,
            transitEdges: updatedTransitEdges,
            totalCost: updatedWaypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + updatedTransitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0)
        });
        setExchangeTargetIndex(null);
        setPanelMode("itinerary");
        return false;
      }
      setExchangeTargetIndex(null);
    }

    // We build the object incrementally to satisfy the discriminated union
    let newEvent: TimelineEvent;
    
    if (isTransport) {
      newEvent = {
        id: crypto.randomUUID(),
        type: 'TRANSPORT',
        method: 'CAR', // Default
        from: 'Current Location', 
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

            const updatedWaypoints = [...activeItinerary.waypoints, newWp];
            const prevLoc = activeItinerary.waypoints.length > 0 
                ? activeItinerary.waypoints[activeItinerary.waypoints.length - 1].locationStr 
                : activeItinerary.startAnchor.locationStr;
            
            const newEdge = {
                fromLocation: prevLoc,
                toLocation: service.name,
                defaultDriver: { name: 'Sacred Valley Transfers', priceUsd: 15 },
                alternativeDrivers: []
            };

            const updatedTransitEdges = [...activeItinerary.transitEdges];
            // If we had a return edge, it was at the end. We need to insert before it or replace it.
            if (updatedTransitEdges.length > activeItinerary.waypoints.length) {
                const returnEdge = updatedTransitEdges.pop()!;
                updatedTransitEdges.push(newEdge);
                updatedTransitEdges.push({
                    ...returnEdge,
                    fromLocation: service.name
                });
            } else {
                updatedTransitEdges.push(newEdge);
            }

            setActiveItinerary({
                ...activeItinerary,
                waypoints: updatedWaypoints,
                transitEdges: updatedTransitEdges,
                totalCost: updatedWaypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + updatedTransitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0)
            });
            
            setAiPromptToTrigger(`I just added ${service.name} to my itinerary.`);
            setIsChatOpen(true);
        } else {
            // Initialize a new itinerary if none exists
            const newItin: OptimizedPlan = {
                title: "New Expedition",
                startAnchor: {
                    title: "Urubamba",
                    locationStr: "Urubamba",
                    type: 'GENERIC_TOWN',
                    lat: COORDS_MAP.urubamba.lat,
                    lng: COORDS_MAP.urubamba.lng,
                    time: "09:00"
                },
                endAnchor: {
                    title: "Urubamba",
                    locationStr: "Urubamba",
                    type: 'GENERIC_TOWN',
                    lat: COORDS_MAP.urubamba.lat,
                    lng: COORDS_MAP.urubamba.lng,
                    time: "18:00"
                },
                waypoints: [{
                    id: crypto.randomUUID(),
                    category: service.category,
                    title: service.name,
                    locationStr: service.name,
                    durationMins: 120,
                    priceUsd: 0,
                    lat: service.lat || undefined,
                    lng: service.lng || undefined,
                    rating: service.rating || undefined
                }],
                transitEdges: [
                    {
                        fromLocation: "Urubamba",
                        toLocation: service.name,
                        defaultDriver: { name: 'Sacred Valley Transfers', priceUsd: 15 },
                        alternativeDrivers: []
                    },
                    {
                        fromLocation: service.name,
                        toLocation: "Urubamba",
                        defaultDriver: { name: 'Return Transfer', priceUsd: 15 },
                        alternativeDrivers: []
                    }
                ],
                needsAccommodationUpsell: true,
                totalCost: 30
            };
            setActiveItinerary(newItin);
            setAiPromptToTrigger(`I just added ${service.name} to my itinerary.`);
            setIsChatOpen(true);
        }

        if (currentTrip) {
            addEvent(dayNum, newEvent);
        }
        setPanelMode('itinerary');
    } else {
        isNewTrip = true;
    }

    return isNewTrip;
  }, [activeDayNumber, addEvent, activeItinerary, currentTrip, panelMode, setIsChatOpen, setActiveItinerary, setPanelMode]);

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
      moveWaypoint,
      swapDriverAlternative,
      truncateAfterWaypoint,
      setStartAnchorLocation,
      updateEvent,
      insertWaypoint,
      isChatOpen,
      setIsChatOpen,
      travelVibe,
      setTravelVibe,
      travelIntensity,
      setTravelIntensity,
      isWorkspaceCollapsed,
      setIsWorkspaceCollapsed,
      exchangeTargetIndex,
      setExchangeTargetIndex,
      aiPromptToTrigger,
      setAiPromptToTrigger,
      bookingStatus,
      entityStatuses,
      startBookingOrchestration,
      resetBooking
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
