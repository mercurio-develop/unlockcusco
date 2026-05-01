"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { DraftTrip, DraftDay, DraftPax, TimelineEvent } from "../types"

interface BuilderContextType {
  draftTrip: DraftTrip
  setDraftTrip: React.Dispatch<React.SetStateAction<DraftTrip>>
  updateTripMeta: (meta: Partial<DraftTrip>) => void
  updateDay: (dayNumber: number, updates: Partial<DraftDay>) => void
  
  // Event Management
  addEventToDay: (dayNumber: number, event: TimelineEvent) => void
  removeEventFromDay: (dayNumber: number, eventId: string) => void
  updateEventInDay: (dayNumber: number, eventId: string, updates: Partial<TimelineEvent>) => void

  // View State
  viewState: 'wizard' | 'workspace' | 'checkout'
  setViewState: (state: 'wizard' | 'workspace' | 'checkout') => void
  activeDayNumber: number | null
  setActiveDayNumber: (day: number | null) => void

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
  const [viewState, setViewState] = useState<'wizard' | 'workspace' | 'checkout'>('wizard')
  const [activeDayNumber, setActiveDayNumber] = useState<number | null>(null)

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

  const addEventToDay = (dayNumber: number, event: TimelineEvent) => {
    setDraftTrip(prev => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.dayNumber !== dayNumber) return day
        // Sort events by startTime after adding
        const newEvents = [...day.events, event].sort((a, b) => a.startTime.localeCompare(b.startTime))
        return { ...day, events: newEvents }
      })
    }))
  }

  const removeEventFromDay = (dayNumber: number, eventId: string) => {
     setDraftTrip(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.dayNumber === dayNumber
          ? { ...day, events: day.events.filter(e => e.id !== eventId) }
          : day
      )
    }))
  }

  const updateEventInDay = (dayNumber: number, eventId: string, updates: Partial<TimelineEvent>) => {
    setDraftTrip(prev => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.dayNumber !== dayNumber) return day
        const updatedEvents = day.events.map(e => e.id === eventId ? { ...e, ...updates } as TimelineEvent : e)
        // Re-sort in case time changed
        updatedEvents.sort((a, b) => a.startTime.localeCompare(b.startTime))
        return { ...day, events: updatedEvents }
      })
    }))
  }

  const resetBuilder = () => {
    setDraftTrip(initialDraftTrip)
    setViewState('wizard')
    setActiveDayNumber(null)
  }

  return (
    <BuilderContext.Provider value={{
      draftTrip,
      setDraftTrip,
      updateTripMeta,
      updateDay,
      addEventToDay,
      removeEventFromDay,
      updateEventInDay,
      viewState,
      setViewState,
      activeDayNumber,
      setActiveDayNumber,
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
