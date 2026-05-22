"use client";

import { useEffect, useRef } from "react";
import { useItineraryStore } from "./use-itinerary-store";
import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema";

export function StoreInitializer({ initialItinerary }: { initialItinerary?: (OptimizedPlan & { shortId?: string }) | null }) {
  const initialized = useRef<string | null>(null);

  // Initial render (server/hydration)
  // eslint-disable-next-line react-hooks/refs
  if (initialized.current === null) {
    if (initialItinerary) {
      useItineraryStore.setState({ activeItinerary: initialItinerary });
      // eslint-disable-next-line react-hooks/refs
      initialized.current = initialItinerary.shortId || "loaded";
    } else {
      // eslint-disable-next-line react-hooks/refs
      initialized.current = "empty";
    }
  }

  // Effect for client-side navigation updates
  useEffect(() => {
    if (initialItinerary) {
      const currentId = initialItinerary.shortId || "loaded";
      if (initialized.current !== currentId) {
        useItineraryStore.setState({ activeItinerary: initialItinerary });
        initialized.current = currentId;
      }
    }
  }, [initialItinerary]);

  return null;
}