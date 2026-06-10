"use client";

export function StoreInitializer() {
  // We remove the aggressive overwrite. Loading ?trip= is now handled safely 
  // via collision dialogs in ExploreView to protect the user's local state.
  return null;
}