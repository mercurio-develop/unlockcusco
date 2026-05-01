"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { DraftTrip, DraftDay, DraftPax } from "../types"

interface BuilderContextType {
  draftTrip: DraftTrip
  setDraftTrip: React.Dispatch<React.SetStateAction<DraftTrip>>
  updateTripMeta: (meta: Partial<DraftTrip>) => void
  updateDay: (dayNumber: number, updates: Partial<DraftDay>) => void
  addPackageToDay: (dayNumber: number, packageId: string) => void
  removePackageFromDay: (dayNumber: number, packageId: string) => void
  viewState: 'wizard' | 'canvas' | 'checkout'
  setViewState: (state: 'wizard' | 'canvas' | 'checkout') => void
  resetBuilder: () => void
}

const initialDraftTrip: DraftTrip = {
  title: "",
  startDate: "",
  endDate: "",
  paxCount: 1,
  days: [],
  leadPax: { name: "", email: "", phone: "" },
  clientNotes: "",
  internalNotes: "",
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [draftTrip, setDraftTrip] = useState<DraftTrip>(initialDraftTrip)
  const [viewState, setViewState] = useState<'wizard' | 'canvas' | 'checkout'>('wizard')

  const updateTripMeta = (meta: Partial<DraftTrip>) => {
    setDraftTrip(prev => ({ ...prev, ...meta }))
  }

  const updateDay = (dayNumber: number, updates: Partial<DraftDay>) => {
    setDraftTrip(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.dayNumber === dayNumber ? { ...day, ...updates } : day
      )
    }))
  }

  const addPackageToDay = (dayNumber: number, packageId: string) => {
    setDraftTrip(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.dayNumber === dayNumber && !day.packageIds.includes(packageId)
          ? { ...day, packageIds: [...day.packageIds, packageId] }
          : day
      )
    }))
  }

  const removePackageFromDay = (dayNumber: number, packageId: string) => {
     setDraftTrip(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.dayNumber === dayNumber
          ? { ...day, packageIds: day.packageIds.filter(id => id !== packageId) }
          : day
      )
    }))
  }

  const resetBuilder = () => {
    setDraftTrip(initialDraftTrip)
    setViewState('wizard')
  }

  return (
    <BuilderContext.Provider value={{
      draftTrip,
      setDraftTrip,
      updateTripMeta,
      updateDay,
      addPackageToDay,
      removePackageFromDay,
      viewState,
      setViewState,
      resetBuilder
    }}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const context = useContext(BuilderContext)
  if (context === undefined) {
    throw new Error("useBuilder must be used within a BuilderProvider")
  }
  return context
}
