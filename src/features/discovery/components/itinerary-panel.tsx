"use client";

import { useTrip } from "@/lib/store/trip-context";
import { Navigation, MapPin, Bed, Plane, ArrowRight, X } from "lucide-react";
import { BusinessCard } from "./business-card";

export function ItineraryPanel() {
  const { 
    activeItinerary, 
    setPanelMode, 
    selectedId,
    setSelectedId
  } = useTrip();

  if (!activeItinerary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
          <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-50">
            <Navigation className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">Your Route is Empty</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Ask the Vallecito Concierge to "plan a full day itinerary" to see your route magically appear here.
        </p>
        <button
          onClick={() => setPanelMode("discover")}
          className="w-full bg-slate-900 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          Go to Discover
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200 shrink-0 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Route</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-slate-900 truncate">
            {activeItinerary.title || "My Route"}
          </h2>
        </div>
        <button 
          onClick={() => setPanelMode("discover")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 space-y-4">
        
        {/* Start Anchor */}
        <div 
          onClick={() => setSelectedId('itin-start')}
          className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedId === 'itin-start' ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900' : 'bg-white border-gray-200 hover:border-slate-300'}`}
        >
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-inner">
            {activeItinerary.startAnchor.type === 'AIRPORT' ? <Plane className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Start Point</p>
            <p className="text-sm font-semibold text-slate-900">{activeItinerary.startAnchor.title}</p>
            {activeItinerary.startAnchor.time && <p className="text-xs text-slate-500 mt-1">{activeItinerary.startAnchor.time}</p>}
          </div>
        </div>

        {/* Waypoints */}
        {activeItinerary.waypoints.map((waypoint, idx) => (
          <div key={waypoint.id} className="relative">
            {/* Connecting line */}
            <div className="absolute left-9 -top-4 w-[2px] h-4 bg-gray-200" />
            
            <div 
              onClick={() => setSelectedId(waypoint.id)}
              className={`flex flex-col p-4 rounded-2xl border transition-all cursor-pointer ${selectedId === waypoint.id ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900' : 'bg-white border-gray-200 hover:border-slate-300'}`}
            >
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-900 text-slate-900 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold tracking-widest text-rose-500 uppercase">{waypoint.category}</p>
                    {waypoint.startTime && <p className="text-xs font-semibold text-slate-500">{waypoint.startTime}</p>}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{waypoint.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {waypoint.locationStr}</p>
                </div>
              </div>
              
              {/* Optional: Render full business card if it's a resolved service */}
              {waypoint.service && selectedId === waypoint.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <BusinessCard business={waypoint.service} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* End Anchor */}
        <div className="relative">
          <div className="absolute left-9 -top-4 w-[2px] h-4 bg-gray-200" />
          <div 
            onClick={() => setSelectedId('itin-arrival')}
            className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedId === 'itin-arrival' ? 'bg-white border-rose-500 shadow-md ring-1 ring-rose-500' : 'bg-white border-gray-200 hover:border-slate-300'}`}
          >
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-rose-500 uppercase">End Point</p>
              <p className="text-sm font-semibold text-slate-900">{activeItinerary.endAnchor.title}</p>
              {activeItinerary.endAnchor.time && <p className="text-xs text-slate-500 mt-1">{activeItinerary.endAnchor.time}</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
