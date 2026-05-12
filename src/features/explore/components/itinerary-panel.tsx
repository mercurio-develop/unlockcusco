"use client";

import { useItinerary } from "@/lib/store/itinerary-context";
import { usePreferences } from "@/lib/store/preferences-context";
import { MapPin, Route, LayoutGrid } from "lucide-react";
import { BuilderWorkspace } from "@/features/pro-builder/components/BuilderWorkspace";

export function ItineraryPanel() {
  const { 
    activeItinerary, 
    setPanelMode, 
    selectedId,
    setSelectedId
  } = useItinerary();
  const { setIsChatOpen } = usePreferences();
  
  if (!activeItinerary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
          <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-50">
            <Route className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">Your Route is Empty</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Start building your route! Discover experiences and add them to your day to visually see your path mapped out.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <button
            onClick={() => setPanelMode("categories")}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <LayoutGrid className="w-4 h-4" /> Go to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
      {/* Simple Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Route</span>
        </div>
        <h2 className="text-xl font-serif font-semibold text-slate-900 truncate">
          My Route
        </h2>
        <p className="text-xs text-slate-500 mt-1">Reorder blocks to see travel times update on the map.</p>
      </div>

      {/* Content Area - The Blocks */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50/30">
        <BuilderWorkspace variant="live" selectedId={selectedId} onSelectEvent={setSelectedId} />
      </div>
    </div>
  );
}
