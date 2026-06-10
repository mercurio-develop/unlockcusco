"use client";

export function StoreInitializer(_props: { initialItinerary?: unknown }) {
  // We remove the aggressive overwrite. Loading ?trip= is now handled safely 
  // via collision dialogs in ExploreView to protect the user's local state.
  return null;
}