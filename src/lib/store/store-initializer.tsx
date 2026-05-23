"use client";

import { useEffect, useRef } from "react";
import { useItineraryStore } from "./use-itinerary-store";
import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema";

export function StoreInitializer({ initialItinerary }: { initialItinerary?: (OptimizedPlan & { shortId?: string }) | null }) {
  const initialized = useRef<string | null>(null);

  useEffect(() => {
    if (initialItinerary) {
      const currentId = initialItinerary.shortId || "loaded";
      if (initialized.current !== currentId) {
        useItineraryStore.setState({ activeItinerary: initialItinerary });
        initialized.current = currentId;
      }
    } else {
      if (initialized.current !== "empty") {
        useItineraryStore.setState({ activeItinerary: null });
        initialized.current = "empty";
      }
    }
  }, [initialItinerary]);

  return null;
}