"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';

type PanelMode = "categories" | "itinerary" | "macro";

interface ItineraryContextType {
  activeItinerary: OptimizedPlan | null;
  setActiveItinerary: (i: OptimizedPlan | null) => void;
  macroTrip: any | null;
  setMacroTrip: (trip: any | null) => void;
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  exchangeTargetIndex: number | null;
  setExchangeTargetIndex: (idx: number | null) => void;
  swapWaypointAlternative: (waypointIdx: number, altIdx: number) => void;
  swapDriverAlternative: (edgeIdx: number, altIdx: number) => void;
  removeWaypoint: (waypointIdx: number) => void;
  moveWaypoint: (fromIdx: number, toIdx: number) => void;
  insertWaypoint: (business: any) => void;
  dismissAccommodation: () => void;
  addAccommodation: (accommodationAlts: any[]) => void;
  selectBasecamp: (hotel: any) => void;
  setStartAnchorLocation: (lat: number, lng: number, name?: string) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [activeItinerary, setActiveItinerary] = useState<OptimizedPlan | null>(null);
  const [macroTrip, setMacroTrip] = useState<any | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("categories");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [exchangeTargetIndex, setExchangeTargetIndex] = useState<number | null>(null);

  const swapWaypointAlternative = (waypointIdx: number, altIdx: number) => {
    if (!activeItinerary) return;
    const newItinerary = { ...activeItinerary };
    const waypoint = { ...newItinerary.waypoints[waypointIdx] };
    if (waypoint && waypoint.alternatives && waypoint.alternatives[altIdx]) {
      const alt = waypoint.alternatives[altIdx];
      newItinerary.waypoints[waypointIdx] = {
        ...waypoint,
        id: alt.id,
        title: alt.name,
        rating: alt.rating,
        priceUsd: alt.cost,
        lat: alt.lat,
        lng: alt.lng,
        locationStr: alt.locationSlug ? (alt.locationSlug.charAt(0).toUpperCase() + alt.locationSlug.slice(1)) : waypoint.locationStr,
      };
      
      // Update total cost
      (newItinerary as any).totalCost = newItinerary.waypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newItinerary.transitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0);
      
      setActiveItinerary(newItinerary);
    }
  };

  const swapDriverAlternative = (edgeIdx: number, altIdx: number) => {
    if (!activeItinerary) return;
    const newItinerary = { ...activeItinerary };
    const edge = { ...newItinerary.transitEdges[edgeIdx] };
    if (edge && edge.alternativeDrivers && edge.alternativeDrivers[altIdx]) {
      const oldDefault = { ...edge.defaultDriver };
      const newDefault = edge.alternativeDrivers[altIdx];
      
      const newAlternatives = [...edge.alternativeDrivers];
      newAlternatives[altIdx] = oldDefault;
      
      newItinerary.transitEdges[edgeIdx] = {
        ...edge,
        defaultDriver: newDefault,
        alternativeDrivers: newAlternatives
      };
      
      // Update total cost
      (newItinerary as any).totalCost = newItinerary.waypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newItinerary.transitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0);
      
      setActiveItinerary(newItinerary);
    }
  };

  const removeWaypoint = (waypointIdx: number) => {
    if (!activeItinerary) return;
    const newItinerary = { ...activeItinerary };
    newItinerary.waypoints = [...newItinerary.waypoints];
    newItinerary.waypoints.splice(waypointIdx, 1);
    
    if (newItinerary.transitEdges.length > 1) {
      newItinerary.transitEdges = [...newItinerary.transitEdges];
      newItinerary.transitEdges.pop();
    }
    
    (newItinerary as any).totalCost = newItinerary.waypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newItinerary.transitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0);
    setActiveItinerary(newItinerary);
  };

  const moveWaypoint = (fromIdx: number, toIdx: number) => {
    if (!activeItinerary || toIdx < 0 || toIdx >= activeItinerary.waypoints.length) return;
    const newItinerary = { ...activeItinerary };
    const wpts = [...newItinerary.waypoints];
    const [moved] = wpts.splice(fromIdx, 1);
    wpts.splice(toIdx, 0, moved);
    newItinerary.waypoints = wpts;
    setActiveItinerary(newItinerary);
  };

  const insertWaypoint = (business: any) => {
    if (!activeItinerary) return;
    const newItinerary = { ...activeItinerary };
    
    const newAlt = {
      id: business.id,
      name: business.name,
      rating: business.rating,
      lat: business.lat,
      lng: business.lng,
      whatsapp: business.whatsapp ?? undefined,
      distanceKm: "0.0",
      category: business.category,
      cost: 15,
      locationSlug: business.locationSlug,
    };
    
    const destination = newItinerary.endAnchor || (newItinerary as any).destination;

    const newWaypoint = {
      id: business.id,
      category: business.category,
      title: business.name,
      locationStr: business.locationSlug ? (business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1)) : destination.title,
      priceUsd: 15,
      lat: business.lat,
      lng: business.lng,
      rating: business.rating,
      alternatives: [newAlt]
    };

    if (exchangeTargetIndex !== null && exchangeTargetIndex >= 0 && exchangeTargetIndex < newItinerary.waypoints.length) {
      // Exchange logic: replace the target waypoint
      newItinerary.waypoints = [...newItinerary.waypoints];
      newItinerary.waypoints[exchangeTargetIndex] = newWaypoint;
      setExchangeTargetIndex(null); // Reset after exchange
    } else {
      // Insert logic: append to the end
      newItinerary.waypoints = [...newItinerary.waypoints, newWaypoint];
      
      // Quick hack for transit edges to match length
      if (newItinerary.transitEdges.length > 0) {
        newItinerary.transitEdges = [...newItinerary.transitEdges, newItinerary.transitEdges[newItinerary.transitEdges.length - 1]];
      }
    }
    
    (newItinerary as any).totalCost = newItinerary.waypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newItinerary.transitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0);
    setActiveItinerary(newItinerary);
    setPanelMode("itinerary");
  };

  const dismissAccommodation = () => {
    if (!activeItinerary) return;
    const newItinerary = { ...activeItinerary, needsAccommodationUpsell: false };
    setActiveItinerary(newItinerary);
  };

  const addAccommodation = (accommodationAlts: any[]) => {
    if (!activeItinerary || accommodationAlts.length === 0) return;
    const newItinerary = { ...activeItinerary };
    
    const alt = accommodationAlts[0];
    const destination = newItinerary.endAnchor || (newItinerary as any).destination;

    newItinerary.waypoints = [...newItinerary.waypoints, {
      id: alt.id,
      category: 'STAY',
      title: alt.name,
      locationStr: alt.locationSlug ? (alt.locationSlug.charAt(0).toUpperCase() + alt.locationSlug.slice(1)) : destination.title,
      priceUsd: alt.cost ?? 60,
      lat: alt.lat,
      lng: alt.lng,
      rating: alt.rating,
      alternatives: accommodationAlts
    }];
    
    newItinerary.needsAccommodationUpsell = false;
    (newItinerary as any).totalCost = newItinerary.waypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + newItinerary.transitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0);
    
    setActiveItinerary(newItinerary);
  };

  const selectBasecamp = (hotel: any) => {
    if (!activeItinerary) return;
    const newItinerary = { ...activeItinerary };
    
    if (newItinerary.endAnchor) {
      newItinerary.endAnchor = {
        ...newItinerary.endAnchor,
        title: hotel.name,
        type: 'HOTEL',
        lat: hotel.lat,
        lng: hotel.lng,
        locationStr: hotel.locationSlug ? (hotel.locationSlug.charAt(0).toUpperCase() + hotel.locationSlug.slice(1)) : newItinerary.endAnchor.locationStr,
      };
    } else if ((newItinerary as any).destination) {
       (newItinerary as any).destination = {
        ...(newItinerary as any).destination,
        title: hotel.name,
        lat: hotel.lat,
        lng: hotel.lng,
      };
    }
    
    setActiveItinerary(newItinerary);
    setSelectedId('itin-arrival');
  };

  const setStartAnchorLocation = (lat: number, lng: number, name: string = "Current Location") => {
    if (!activeItinerary) return;
    const newItinerary = { ...activeItinerary };
    if (newItinerary.startAnchor) {
      newItinerary.startAnchor = {
        ...newItinerary.startAnchor,
        lat,
        lng,
        title: name,
        locationStr: "Live GPS"
      };
    } else if ((newItinerary as any).origin) {
      (newItinerary as any).origin = {
        ...(newItinerary as any).origin,
        lat,
        lng,
        title: name,
      };
    }
    setActiveItinerary(newItinerary);
  };

  return (
    <ItineraryContext.Provider value={{
      activeItinerary,
      setActiveItinerary,
      macroTrip,
      setMacroTrip,
      panelMode,
      setPanelMode,
      selectedId,
      setSelectedId,
      isEditMode,
      setIsEditMode,
      exchangeTargetIndex,
      setExchangeTargetIndex,
      swapWaypointAlternative,
      swapDriverAlternative,
      removeWaypoint,
      moveWaypoint,
      insertWaypoint,
      dismissAccommodation,
      addAccommodation,
      selectBasecamp,
      setStartAnchorLocation
    }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}
