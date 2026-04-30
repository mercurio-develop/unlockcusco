"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useItinerary } from "@/lib/store/itinerary-context";
import { MapPin, ChevronRight, CheckCircle2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayExplorer } from "@/components/trip/DayExplorer";

export function ItineraryPanel() {
  const { activeItinerary, setPanelMode, isEditMode, setIsEditMode, macroTrip } = useItinerary();
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

  const totalCost = (activeItinerary as any).totalCost ?? 0;

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 bg-slate-900 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          {macroTrip ? (
            <button 
              onClick={() => setPanelMode("macro")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Trip Plan
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Plan</span>
            </div>
          )}
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors",
              isEditMode ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30" : "bg-white/5 text-slate-400 hover:bg-white/10"
            )}
          >
            {isEditMode ? <><CheckCircle2 className="w-3.5 h-3.5" /> Done</> : <><Edit2 className="w-3.5 h-3.5" /> Edit</>}
          </button>
        </div>
        
        {/* Day Indicator if applicable */}
        {searchParams.get("day") && (
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">DAY {searchParams.get("day")}</span>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Explorer View</span>
          </div>
        )}

        <h2 className="text-xl font-serif font-semibold text-white">{(activeItinerary as any).title ?? "Your Expedition"}</h2>
      </div>

      {/* The Golden Thread Timeline */}
      <DayExplorer />

      {/* Footer total */}
      <div className="px-6 py-5 bg-slate-900 border-t border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 font-medium">Estimated Budget</p>
            <p className="text-2xl font-bold text-white">${totalCost}</p>
          </div>
          <button className="bg-rose-600 text-white rounded-full px-6 py-3 text-sm font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20">
            Book All Stops
          </button>
        </div>
      </div>
    </div>
  );
}
