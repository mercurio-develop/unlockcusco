"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';
import type { Business } from "@prisma/client";
import { usePreferences } from './preferences-context';

export type PanelMode = "discover" | "itinerary";
export type TransportProfile = "driving" | "walking";

export interface RouteData {
  geometry: any;
  legs: any[];
  legGeometries?: any[];
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
  isExchangingStart: boolean;
  setIsExchangingStart: (v: boolean) => void;
  isExchangingEnd: boolean;
  setIsExchangingEnd: (v: boolean) => void;
  isAddingStop: boolean;
  setIsAddingStop: (v: boolean) => void;
  aiPromptToTrigger: string | null;
  setAiPromptToTrigger: (prompt: string | null) => void;
  setStartAnchorLocation: (lat: number, lng: number, title?: string, service?: Business) => void;
  updateEndAnchorLocation: (lat: number, lng: number, title?: string, service?: Business) => void;
  insertWaypoint: (service: Business, skipAiTrigger?: boolean) => boolean;
  swapWaypoint: (targetId: string, newService: Business) => void;
  removeWaypoint: (id: string) => void;
  moveWaypoint: (id: string, direction: "up" | "down") => void;
  setWaypoints: (waypoints: any[]) => void;
  routeData: RouteData | null;
  transportProfiles: Record<number, TransportProfile>;
  setLegTransportProfile: (index: number, profile: TransportProfile) => void;
  mapClickMode: 'start' | 'end' | null;
  setMapClickMode: (mode: 'start' | 'end' | null) => void;
  mapSearchResults: any[] | null;
  setMapSearchResults: (results: any[] | null) => void;
  clearStartAnchor: () => void;
  clearEndAnchor: () => void;
  saveItinerary: () => Promise<string | null>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const { setIsChatOpen } = usePreferences();
  const [activeItinerary, setActiveItinerary] = useState<OptimizedPlan | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("discover");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exchangeTargetId, setExchangeTargetId] = useState<string | null>(null);
  const [isExchangingStart, setIsExchangingStart] = useState(false);
  const [isExchangingEnd, setIsExchangingEnd] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [aiPromptToTrigger, setAiPromptToTrigger] = useState<string | null>(null);
  const [transportProfiles, setTransportProfiles] = useState<Record<number, TransportProfile>>({});
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [mapClickMode, setMapClickMode] = useState<'start' | 'end' | null>(null);
  const [mapSearchResults, setMapSearchResults] = useState<any[] | null>(null);

  const setLegTransportProfile = useCallback((index: number, profile: TransportProfile) => {
    setTransportProfiles(prev => ({ ...prev, [index]: profile }));
  }, []);

  // Load itinerary from URL parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('trip');
    if (tripId && !activeItinerary) {
      fetch(`/api/itineraries/${tripId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.state) {
            setActiveItinerary(data.state);
            setPanelMode("itinerary");
          }
        })
        .catch(err => console.error("Failed to load itinerary", err));
    }
  }, []);

  const saveItinerary = useCallback(async () => {
    if (!activeItinerary) return null;
    try {
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: activeItinerary })
      });
      const data = await res.json();
      if (data.success && data.shortId) {
        const url = new URL(window.location.href);
        url.searchParams.set('trip', data.shortId);
        window.history.replaceState({}, '', url.toString());
        return url.toString();
      }
    } catch (e) {
      console.error("Failed to save itinerary:", e);
    }
    return null;
  }, [activeItinerary]);

  // Global cache for Mapbox routing requests to avoid over-fetching
  const mapboxCacheRef = useRef<Map<string, any>>(new Map());

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

    const fetchLeg = async (p1: [number, number], p2: [number, number], profile: TransportProfile) => {
      const cacheKey = `${profile}_${p1[0]},${p1[1]}_${p2[0]},${p2[1]}`;
      if (mapboxCacheRef.current.has(cacheKey)) {
        return mapboxCacheRef.current.get(cacheKey);
      }

      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${p1[0]},${p1[1]};${p2[0]},${p2[1]}?geometries=geojson&overview=full&steps=true&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        mapboxCacheRef.current.set(cacheKey, data.routes[0]);
        return data.routes[0];
      }
      return null;
    };

    const legPromises = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const profile = transportProfiles[i] || "driving";
      legPromises.push(fetchLeg(pts[i], pts[i + 1], profile));
    }

    Promise.all(legPromises)
      .then(routeResults => {
        let totalDuration = 0;
        const allLegs: any[] = [];
        const legGeometries: any[] = [];
        const combinedCoordinates: any[] = [];

        routeResults.forEach((route, index) => {
          if (!route) return;
          totalDuration += route.duration || 0;
          
          if (route.legs && route.legs.length > 0) {
            allLegs.push(route.legs[0]);
          }

          const legCoords: any[] = [];
          if (route.legs && route.legs[0].steps) {
            route.legs[0].steps.forEach((step: any) => {
              if (step.geometry && step.geometry.coordinates) {
                legCoords.push(...step.geometry.coordinates);
                combinedCoordinates.push(...step.geometry.coordinates);
              }
            });
          }

          legGeometries.push({
            type: 'Feature',
            properties: { legIndex: index, profile: transportProfiles[index] || "driving" },
            geometry: {
              type: 'LineString',
              coordinates: legCoords
            }
          });
        });

        if (allLegs.length > 0) {
          setRouteData({
            geometry: {
              type: 'LineString',
              coordinates: combinedCoordinates
            },
            legs: allLegs,
            legGeometries,
            profile: "driving", // Not strictly used for single legs anymore
            duration: totalDuration
          });
        }
      })
      .catch(err => console.error("Mapbox routing error:", err));
  }, [activeItinerary, transportProfiles]);

  const setStartAnchorLocation = useCallback((lat: number, lng: number, title: string = "Current Location", service?: Business, skipAiTrigger: boolean = false) => {
    setActiveItinerary(prev => {
      const base = prev ?? {
        title: "Today's Plan",
        startAnchor: { title, locationStr: title, type: 'GENERIC_TOWN' as const, lat, lng, time: '09:00', service },
        endAnchor:   { title: 'Destination', locationStr: 'Destination', type: 'GENERIC_TOWN' as const, lat: -13.3047, lng: -72.1167, time: '18:00' },
        waypoints: [], transitEdges: [], needsAccommodationUpsell: false, totalCost: 0,
      };
      return {
        ...base,
        startAnchor: { ...base.startAnchor, lat, lng, locationStr: title, title, service }
      };
    });
    if (!skipAiTrigger) {
      setAiPromptToTrigger(`[INTERNAL] I just updated my start location to ${title}.`);
    }
  }, []);

  const clearStartAnchor = useCallback(() => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      return {
        ...prev,
        startAnchor: {
          title: "Current Location",
          locationStr: "Current Location",
          type: 'GENERIC_TOWN' as const,
          lat: undefined as any,
          lng: undefined as any,
          time: '09:00',
          service: undefined
        }
      };
    });
  }, []);

  const updateEndAnchorLocation = useCallback((lat: number, lng: number, title: string = "Custom End Location", service?: Business, skipAiTrigger: boolean = false) => {
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
    if (!skipAiTrigger) {
      setAiPromptToTrigger(`[INTERNAL] I just updated my end location to ${title}.`);
    }
  }, []);

  const insertWaypoint = useCallback((service: Business, skipAiTrigger: boolean = false): boolean => {
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
        const DEFAULT_COORDS = { lat: -13.5226, lng: -71.9673 }; // Cusco
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

    if (!skipAiTrigger) {
      const bName = service.name || "this location";
      setAiPromptToTrigger(`[INTERNAL] I just added ${bName} to my itinerary.`);
    }
    setPanelMode('itinerary');
    setIsAddingStop(false);
    return true;
  }, []);

  const swapWaypoint = useCallback((targetId: string, newService: Business, skipAiTrigger: boolean = false) => {
    setActiveItinerary(prev => {
      if (!prev) return null;
      
      if (targetId === 'itin-start' && prev.startAnchor) {
        return {
          ...prev,
          startAnchor: {
            ...prev.startAnchor,
            title: newService.name || 'Current Location',
            locationStr: newService.name || 'Current Location',
            lat: newService.lat || prev.startAnchor.lat,
            lng: newService.lng || prev.startAnchor.lng,
            service: newService as any
          }
        };
      }
      
      if (targetId === 'itin-arrival' && prev.endAnchor) {
        return {
          ...prev,
          endAnchor: {
            ...prev.endAnchor,
            title: newService.name || 'Destination',
            locationStr: newService.name || 'Destination',
            lat: newService.lat || prev.endAnchor.lat,
            lng: newService.lng || prev.endAnchor.lng,
            service: newService as any
          }
        };
      }

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
    if (!skipAiTrigger) {
      setAiPromptToTrigger(`[INTERNAL] I just swapped an item in my itinerary with ${newService.name || "this location"}.`);
    }
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
      const index = prev.waypoints.findIndex(w => 
        w.id === id || 
        w.title?.toLowerCase().includes(id.toLowerCase()) || 
        w.locationStr?.toLowerCase().includes(id.toLowerCase())
      );
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
      isExchangingStart,
      setIsExchangingStart,
      isExchangingEnd,
      setIsExchangingEnd,
      isAddingStop,
      setIsAddingStop,
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
      transportProfiles,
      setLegTransportProfile,
      mapClickMode,
      setMapClickMode,
      mapSearchResults,
      setMapSearchResults,
      clearStartAnchor,
      clearEndAnchor,
      saveItinerary,
  }), [
      activeItinerary, panelMode, selectedId, exchangeTargetId, isExchangingStart, isExchangingEnd, isAddingStop, aiPromptToTrigger,
      setStartAnchorLocation, updateEndAnchorLocation, insertWaypoint, swapWaypoint,
      removeWaypoint, moveWaypoint, setWaypoints, routeData, transportProfiles,
      mapClickMode, mapSearchResults, setMapSearchResults, clearStartAnchor, clearEndAnchor, saveItinerary,
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