"use client";

import { useEffect, useRef } from "react";
import { useItineraryStore } from "./use-itinerary-store";
import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema";

export function StoreInitializer({ initialItinerary }: { initialItinerary?: (OptimizedPlan & { shortId?: string }) | null }) {
  // We remove the aggressive overwrite. Loading ?trip= is now handled safely 
  // via collision dialogs in ExploreView to protect the user's local state.
  return null;
}