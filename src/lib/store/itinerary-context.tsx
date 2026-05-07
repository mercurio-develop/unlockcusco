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
    // Methods already present in trip-context are automatically proxied by ...trip
  };
}

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
