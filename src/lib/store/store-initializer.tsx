"use client";

import { useRef } from "react";
import { useItineraryStore } from "./use-itinerary-store";
import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema";

export function StoreInitializer({ initialItinerary }: { initialItinerary?: OptimizedPlan | null }) {
  const initialized = useRef<boolean | null>(null);
  if (initialized.current === null) {
    if (initialItinerary) {
      useItineraryStore.setState({ activeItinerary: initialItinerary });
    }
    initialized.current = true;
  }
  return null;
}