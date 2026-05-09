"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PreferencesContextType {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  travelVibe: string | null;
  setTravelVibe: (vibe: string | null) => void;
  travelIntensity: number | null;
  setTravelIntensity: (intensity: number | null) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [travelVibe, setTravelVibe] = useState<string | null>(null);
  const [travelIntensity, setTravelIntensity] = useState<number | null>(null);

  return (
    <PreferencesContext.Provider value={{
      isChatOpen,
      setIsChatOpen,
      travelVibe,
      setTravelVibe,
      travelIntensity,
      setTravelIntensity
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
