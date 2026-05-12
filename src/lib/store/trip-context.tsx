"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';
import type { Business } from "@prisma/client";
import { usePreferences } from './preferences-context';

export type PanelMode = "discover" | "itinerary";
export type TransportProfile = "driving" | "walking";

export interface RouteData {
  geometry: any;
  legs: any[];
  profile: TransportProfile;
  duration?: number;
}

interface TripContextType {
  activeItinerary: OptimizedPlan | null;
  setActiveItinerary: React.Dispatch<React.SetStateAction<OptimizedPlan | null>>;
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  exchangeTargetId: string | null;
  setExchangeTargetId: (id: string | null) => void;
  isExchangingEnd: boolean;
  setIsExchangingEnd: (v: boolean) => void;
  aiPromptToTrigger: string | null;
  setAiPromptToTrigger: (prompt: string | null) => void;
  setStartAnchorLocation: (lat: number, lng: number, title?: string) => void;
  updateEndAnchorLocation: (lat: number, lng: number, title?: string, service?: Business) => void;
  insertWaypoint: (service: Business) => boolean;
  swapWaypoint: (targetId: string, newService: Business) => void;
  removeWaypoint: (id: string) => void;
  moveWaypoint: (id: string, direction: "up" | "down") => void;
  setWaypoints: (waypoints: any[]) => void;
  routeData: RouteData | null;
  transportProfile: TransportProfile;
  setTransportProfile: (profile: TransportProfile) => void;
  mapClickMode: 'end' | null;
  setMapClickMode: (mode: 'end' | null) => void;
  clearEndAnchor: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const { setIsChatOpen } = usePreferences();
  const [activeItinerary, setActiveItinerary] = useState<OptimizedPlan | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("discover");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exchangeTargetId, setExchangeTargetId] = useState<string | null>(null);
  const [isExchangingEnd, setIsExchangingEnd] = useState(false);
  const [aiPromptToTrigger, setAiPromptToTrigger] = useState<string | null>(null);
  const [transportProfile, setTransportProfile] = useState<TransportProfile>("driving");
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [mapClickMode, setMapClickMode] = useState<'end' | null>(null);

  useEffect(() => {
    if (!activeItinerary) {
      setRouteData(null);
      return;
    }

    const pts: [number, number][] = [];
    const start = activeItinerary.startAnchor;
    if (start?.lat != null && start?.lng != null) pts.push([start.lng, start.lat]);

    for (const waypoint of activeItinerary.waypoints || []) {
      if (waypoint.lat != null && waypoint.lng != null) pts.push([waypoint.lng, waypoint.lat]);
    }

    const end = activeItinerary.endAnchor;
    if (end?.lat != null && end?.lng != null) pts.push([end.lng, end.lat]);

    if (pts.length < 2) {
      setRouteData(null);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    const coordsStr = pts.map(p => `${p[0]},${p[1]}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/${transportProfile}/${coordsStr}?geometries=geojson&overview=full&access_token=${token}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes[0]) {
          setRouteData({
            geometry: data.routes[0].geometry,
            legs: data.routes[0].legs,
            profile: transportProfile,
            duration: data.routes[0].duration
          });
        }
      })
      .catch(err => console.error("Mapbox routing error:", err));
  }, [activeItinerary, transportProfile]);

  const setStartAnchorLocation = useCallback((lat: number, lng: number, title: string = "Current Location") => {
    setActiveItinerary(prev => {
      const base = prev ?? {
        title: "Today's Plan",
        startAnchor: { title, locationStr: title, type: 'GENERIC_TOWN' as const, lat, lng, time: '09:00' },
        endAnchor:   { title: 'Destination', locationStr: 'Destination', type: 'GENERIC_TOWN' as const, lat: -13.3047, lng: -72.1167, time: '18:00' },
        waypoints: [], transitEdges: [], needsAccommodationUpsell: false, totalCost: 0,
      };
      return {
        ...base,
        startAnchor: { ...base.startAnchor, lat, lng, locationStr: title, title }
      };
    });
  }, []);

  const updateEndAnchorLocation = useCallback((lat: number, lng: number, title: string = "Custom End Location", service?: Business) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      return {
        ...prev,
        endAnchor: {
          ...prev.endAnchor,
          lat,
          lng,
          locationStr: title,
          title: title,
          ...(service !== undefined ? { service } : {}),
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
        const DEFAULT_COORDS = { lat: -13.3047, lng: -72.1167 }; // Urubamba
        return {
          title: "Today's Plan",
          startAnchor: {
            title: 'Current Location', locationStr: 'Current Location',
            type: 'GENERIC_TOWN' as const,
            lat: DEFAULT_COORDS.lat, lng: DEFAULT_COORDS.lng, time: '09:00'
          },
          endAnchor: {
            title: 'Destination', locationStr: 'Destination',
            type: 'GENERIC_TOWN' as const,
            lat: undefined, lng: undefined, time: '18:00'
          },
          waypoints: [newWaypoint],
          transitEdges: [],
          needsAccommodationUpsell: false,
          totalCost: 0
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

  const removeWaypoint = useCallback((id: string) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      return { ...prev, waypoints: prev.waypoints.filter(w => w.id !== id) };
    });
  }, []);

  const moveWaypoint = useCallback((id: string, direction: "up" | "down") => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      const index = prev.waypoints.findIndex(w => w.id === id);
      if (index < 0) return prev;
      
      const newWaypoints = [...prev.waypoints];
      if (direction === "up" && index > 0) {
        [newWaypoints[index - 1], newWaypoints[index]] = [newWaypoints[index], newWaypoints[index - 1]];
      } else if (direction === "down" && index < newWaypoints.length - 1) {
        [newWaypoints[index], newWaypoints[index + 1]] = [newWaypoints[index + 1], newWaypoints[index]];
      } else {
        return prev;
      }
      return { ...prev, waypoints: newWaypoints };
    });
  }, []);

  const clearEndAnchor = useCallback(() => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      return {
        ...prev,
        endAnchor: {
          ...prev.endAnchor,
          title: 'Destination',
          locationStr: 'Destination',
          lat: -13.3047,
          lng: -72.1167,
          service: undefined,
        }
      };
    });
  }, []);

  const setWaypoints = useCallback((waypoints: any[]) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      return { ...prev, waypoints };
    });
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
      isExchangingEnd,
      setIsExchangingEnd,
      aiPromptToTrigger,
      setAiPromptToTrigger,
      setStartAnchorLocation,
      updateEndAnchorLocation,
      insertWaypoint,
      swapWaypoint,
      removeWaypoint,
      moveWaypoint,
      setWaypoints,
      routeData,
      transportProfile,
      setTransportProfile,
      mapClickMode,
      setMapClickMode,
      clearEndAnchor,
  }), [
      activeItinerary, panelMode, selectedId, exchangeTargetId, isExchangingEnd, aiPromptToTrigger,
      setStartAnchorLocation, updateEndAnchorLocation, insertWaypoint, swapWaypoint,
      removeWaypoint, moveWaypoint, setWaypoints, routeData, transportProfile,
      mapClickMode, clearEndAnchor,
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