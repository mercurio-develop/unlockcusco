"use client";

import { useTrip } from "./trip-context";

/**
 * Legacy Bridge: ItineraryContext proxy
 * This shim allows components still using useItinerary to work with the new TripContext
 * while we migrate them.
 */
export function useItinerary() {
  const trip = useTrip();
  
  return {
    ...trip,
    // Add any legacy mapping here if names changed
    removeWaypoint: (id: string | number) => trip.removeEvent(trip.activeDayNumber || 1, String(id)),
    // Placeholder for other missing methods to prevent immediate crashes
    setStartAnchorLocation: (...args: any[]) => {},
    setEndAnchorLocation: (...args: any[]) => {},
    selectBasecamp: (...args: any[]) => {},
    setExchangeTargetIndex: (...args: any[]) => {},
    swapDriverAlternative: (...args: any[]) => {},
    moveWaypoint: (...args: any[]) => {},
    truncateAfterWaypoint: (...args: any[]) => {}
  };
}

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
