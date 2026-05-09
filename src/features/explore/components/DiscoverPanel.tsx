"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { BusinessCard } from "@/features/business/components/business-card"
import { useTrip } from "@/lib/store/trip-context"
import { useRouter } from "next/navigation"
import type { Business } from "@prisma/client"

interface DiscoverPanelProps {
  businesses: Business[]
  selectedId?: string | null
  setSelectedId: (id: string) => void
  onReset: () => void
}

export function DiscoverPanel({ businesses, selectedId, setSelectedId, onReset }: DiscoverPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      {businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
            <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-50">
              <Search className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">No experiences found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            The Valley is vast, but we couldn't find matches for these specific filters. Try expanding your search or resetting your preferences.
          </p>
          <button 
            onClick={onReset}
            className="bg-slate-900 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 pb-20">
           {businesses.map(e => (
             <BusinessCard key={e.id} business={e} isHighlighted={selectedId === e.id} onSelect={() => setSelectedId(e.id)} />
           ))}
        </div>
      )}
    </div>
  )
}
