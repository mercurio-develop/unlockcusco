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
    removeWaypoint: (id: string) => trip.removeEvent(trip.activeDayNumber || 1, id),
    // Placeholder for other missing methods to prevent immediate crashes
    setStartAnchorLocation: () => {},
    setEndAnchorLocation: () => {},
    selectBasecamp: () => {},
    setExchangeTargetIndex: () => {},
    swapDriverAlternative: () => {},
    moveWaypoint: () => {},
    truncateAfterWaypoint: () => {}
  };
}

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
