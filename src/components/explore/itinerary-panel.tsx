"use client";

import { useItinerary } from "@/lib/store/itinerary-context";
import { MapPin, Coffee, Car, Bed, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ItineraryPanel() {
  const { activeRelay, setPanelMode, setSwapModeCategory } = useItinerary();

  if (!activeRelay) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
        <MapPin className="w-12 h-12 mb-4 text-slate-300" />
        <h3 className="text-lg font-serif text-slate-600 mb-2">No Active Itinerary</h3>
        <p className="text-sm">Ask the AI Concierge to build a chronological relay (e.g. "I'm in Pisac and need to get to Ollantaytambo tonight").</p>
      </div>
    );
  }

  const handleSwap = (category: "food" | "transit" | "stay") => {
    setSwapModeCategory(category);
    setPanelMode("categories");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="p-6 pb-2 border-b border-gray-200">
        <h2 className="text-2xl font-serif text-slate-900 mb-1">Your Relay</h2>
        <p className="text-sm text-slate-500">{activeRelay.origin} to {activeRelay.destination}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Origin Food Node */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-rose-600">
              <Coffee className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">1. Taste ({(activeRelay as any).foodLocation || activeRelay.origin})</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleSwap("food")} className="text-slate-400 hover:text-slate-900 h-8 px-2">
              <RefreshCw className="w-3 h-3 mr-1" /> Swap
            </Button>
          </div>
          <h3 className="font-semibold text-slate-900">{activeRelay.food.name}</h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <span>★ {activeRelay.food.rating}</span>
            {activeRelay.food.distance && <span>• {activeRelay.food.distance}</span>}
          </div>
        </div>

        {/* Transit Node */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-rose-600">
              <Car className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">2. Transit</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleSwap("transit")} className="text-slate-400 hover:text-slate-900 h-8 px-2">
              <RefreshCw className="w-3 h-3 mr-1" /> Swap
            </Button>
          </div>
          <h3 className="font-semibold text-slate-900">{activeRelay.transit.name}</h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <span>Driver: {activeRelay.transit.driver}</span>
            <span>• {activeRelay.distanceKm} km</span>
          </div>
        </div>

        {/* Destination Stay Node */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-rose-600">
              <Bed className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">3. Rest ({activeRelay.destination})</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleSwap("stay")} className="text-slate-400 hover:text-slate-900 h-8 px-2">
              <RefreshCw className="w-3 h-3 mr-1" /> Swap
            </Button>
          </div>
          <h3 className="font-semibold text-slate-900">{activeRelay.stay.name}</h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <span>★ {activeRelay.stay.rating}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
