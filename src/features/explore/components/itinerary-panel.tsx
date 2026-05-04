"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useItinerary } from "@/lib/store/itinerary-context";
import { MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayExplorer } from "@/components/trip/DayExplorer";

export function ItineraryPanel() {
  const { activeItinerary, setPanelMode, macroTrip } = useItinerary();
  const searchParams = useSearchParams();

  if (!activeItinerary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
        <MapPin className="w-10 h-10 mb-4 text-slate-200" />
        <h3 className="text-base font-serif text-slate-600 mb-2">No active itinerary</h3>
        <p className="text-sm leading-relaxed">
          Ask the AI Concierge to plan your day &mdash; e.g. <span className="italic">&quot;I&apos;m in Pisac, want coffee, then need to sleep in Ollantaytambo&quot;</span>
        </p>
        <button
          onClick={() => setPanelMode("categories")}
          className="mt-6 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          Browse places instead →
        </button>
      </div>
    );
  }

  const totalCost = activeItinerary.totalCost ?? 0;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          {macroTrip ? (
            <button 
              onClick={() => setPanelMode("macro")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-widest"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Trip Plan
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Plan</span>
            </div>
          )}
        </div>
        
        {/* Day Indicator if applicable */}
        {searchParams.get("day") && (
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md">DAY {searchParams.get("day")}</span>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Explorer View</span>
          </div>
        )}

        <h2 className="text-xl font-serif font-semibold text-slate-900">{activeItinerary.title ?? "Your Expedition"}</h2>
      </div>

      {/* The Golden Thread Timeline */}
      <DayExplorer />

      {/* Footer total */}
      <div className="px-6 py-5 bg-white border-t border-gray-200 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 font-medium">Estimated Budget</p>
            <p className="text-2xl font-bold text-slate-900">${totalCost}</p>
          </div>
          <button className="bg-rose-600 text-white rounded-xl px-6 py-3 text-sm font-bold hover:bg-rose-500 transition-all shadow-md">
            Book All Stops
          </button>
        </div>
      </div>
    </div>
  );
}
