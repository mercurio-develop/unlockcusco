"use client";

import { useState, Component, type ReactNode } from "react";
import { useTrip } from "@/lib/store/trip-context";
import { usePreferences } from "@/lib/store/preferences-context";
import { COORDS_MAP } from "@/lib/constants";
import { getCategoryColor } from "@/lib/utils/category-style";
import { Navigation, MapPin, Bed, Plane, ArrowRight, X, ChevronDown, ChevronUp, GripVertical, Trash2, ArrowUp, ArrowDown, Car, Footprints, MessageCircle, AlertTriangle, Flag, Repeat } from "lucide-react";
import { BusinessCard } from "./business-card";
import { Reorder } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { RouteData, TransportProfile } from "@/lib/store/trip-context";

// Stable component outside ItineraryPanel so React fiber identity is preserved across re-renders
function TransitEdge({ index, routeData, transportProfile }: { index: number; routeData: RouteData | null; transportProfile: TransportProfile }) {
  const leg = routeData?.legs?.[index];
  if (!leg) return <div className="absolute left-9 -top-4 w-[2px] h-4 bg-gray-200 pointer-events-none" />;
  const durationMin = Math.round(leg.duration / 60);
  const distanceKm = (leg.distance / 1000).toFixed(1);
  return (
    <div className="absolute left-9 -top-6 w-[2px] h-6 bg-slate-300 pointer-events-none flex items-center justify-center z-10">
      <div className="absolute w-[85px] bg-white border border-slate-200 shadow-sm rounded-full py-0.5 px-2 flex items-center gap-1.5 ml-28">
        {transportProfile === 'driving' ? <Car className="w-3 h-3 text-slate-500" /> : <Footprints className="w-3 h-3 text-slate-500" />}
        <span className="text-[9px] font-bold text-slate-600 tracking-tight whitespace-nowrap">{durationMin}m ({distanceKm}km)</span>
      </div>
    </div>
  );
}

class ItineraryErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">Route panel crashed</p>
            <p className="text-xs text-slate-500 font-mono">{(this.state.error as Error).message}</p>
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ItineraryPanel() {
  const {
    activeItinerary,
    setPanelMode,
    selectedId,
    setSelectedId,
    removeWaypoint,
    moveWaypoint,
    setWaypoints,
    routeData,
    transportProfile,
    setTransportProfile,
    updateEndAnchorLocation,
    setMapClickMode,
    setAiPromptToTrigger,
    clearEndAnchor,
  } = useTrip();
  const { setIsChatOpen } = usePreferences();

  const [endInput, setEndInput] = useState('');
  const resolveEndInput = () => {
    const val = endInput.trim();
    if (!val) return;
    const lower = val.toLowerCase();
    const match = Object.entries(COORDS_MAP)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([k]) => lower.includes(k.replace(/-/g, ' ')) || lower.includes(k));
    if (match) {
      updateEndAnchorLocation(match[1].lat, match[1].lng, val);
    } else {
      // Not a known town — ask the concierge to find and set it
      setAiPromptToTrigger(`My travel ends at ${val}`);
      setIsChatOpen(true);
    }
    setEndInput('');
  };

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
    <ItineraryErrorBoundary>
    <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200 shrink-0 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Route</span>
            </div>
            {routeData?.duration != null && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                ~{routeData.duration >= 3600
                  ? `${Math.floor(routeData.duration / 3600)}h ${Math.round((routeData.duration % 3600) / 60)}m`
                  : `${Math.round(routeData.duration / 60)}m`}
              </span>
            )}
          </div>
          <h2 className="text-xl font-serif font-semibold text-slate-900 truncate">
            {activeItinerary.title || "My Route"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-full p-1 mr-2">
            <button
              onClick={() => setTransportProfile('driving')}
              className={`p-1.5 rounded-full transition-colors ${transportProfile === 'driving' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Car className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTransportProfile('walking')}
              className={`p-1.5 rounded-full transition-colors ${transportProfile === 'walking' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Footprints className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setPanelMode("discover")}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 space-y-4">
        
        {/* Start Anchor */}
        <div 
          onClick={() => setSelectedId('itin-start')}
          className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedId === 'itin-start' ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900' : 'bg-white border-gray-200 hover:border-slate-300'}`}
        >
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-inner">
            {activeItinerary.startAnchor?.type === 'AIRPORT' ? <Plane className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Start Point</p>
            <p className="text-sm font-semibold text-slate-900">{activeItinerary.startAnchor?.title || "Current Location"}</p>
            {activeItinerary.startAnchor?.time && <p className="text-xs text-slate-500 mt-1">{activeItinerary.startAnchor.time}</p>}
          </div>
        </div>

        {/* Waypoints */}
        <Reorder.Group axis="y" values={activeItinerary.waypoints || []} onReorder={setWaypoints} className="space-y-6 relative w-full mt-6">
          {(activeItinerary.waypoints || []).map((waypoint, idx) => (
            <Reorder.Item key={waypoint.id} value={waypoint} id={waypoint.id} className="relative">
              <TransitEdge index={idx} routeData={routeData} transportProfile={transportProfile} />
              
              <div
                className={`flex flex-col p-4 rounded-2xl border-l-4 border border-l-[var(--step-color)] transition-all ${selectedId === waypoint.id ? 'bg-white shadow-md ring-1 ring-[var(--step-color)]' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                style={{ '--step-color': getCategoryColor(waypoint.category) } as React.CSSProperties}
              >
                <div className="flex gap-3 items-start">
                  <div
                    className="w-10 h-10 rounded-full text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md cursor-grab active:cursor-grabbing"
                    style={{ backgroundColor: getCategoryColor(waypoint.category) }}
                  >
                    {idx + 1}
                  </div>
                  
                  <div 
                    className="flex-1 cursor-pointer select-none"
                    onClick={() => setSelectedId(selectedId === waypoint.id ? null : waypoint.id)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold tracking-widest text-rose-500 uppercase">{waypoint.category}</p>
                      {waypoint.startTime && <p className="text-xs font-semibold text-slate-500">{waypoint.startTime}</p>}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{waypoint.title}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {waypoint.locationStr}</p>
                  </div>

                  {/* Always-Visible Actions Row */}
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <button 
                      disabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); moveWaypoint(waypoint.id, "up"); }}
                      className="w-6 h-6 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button 
                      disabled={idx === (activeItinerary.waypoints || []).length - 1}
                      onClick={(e) => { e.stopPropagation(); moveWaypoint(waypoint.id, "down"); }}
                      className="w-6 h-6 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <Dialog>
                      <DialogTrigger render={
                        <button 
                          onClick={(e) => { e.stopPropagation(); }}
                          className="w-6 h-6 rounded bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      } />
                      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                        <DialogHeader>
                          <DialogTitle>Remove Stop</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove <strong>{waypoint.title}</strong> from your itinerary?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                          <DialogClose render={<Button variant="outline">Cancel</Button>} />
                          <DialogClose render={
                            <Button variant="destructive" onClick={(e) => { e.stopPropagation(); removeWaypoint(waypoint.id); }}>
                              Remove
                            </Button>
                          } />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {waypoint.lat != null && waypoint.lng != null && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateEndAnchorLocation(waypoint.lat!, waypoint.lng!, waypoint.title, waypoint.service);
                          removeWaypoint(waypoint.id);
                        }}
                        title="Set as end of trip"
                        className="w-6 h-6 rounded bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedId(selectedId === waypoint.id ? null : waypoint.id); }}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ml-1"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${selectedId === waypoint.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {/* Expandable Section with CSS Grid Transition */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${selectedId === waypoint.id ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    {waypoint.service && (
                      <BusinessCard business={waypoint.service} orientation="horizontal" />
                    )}
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* End Anchor */}
        <div className="relative mt-6">
          <TransitEdge index={(activeItinerary.waypoints || []).length} routeData={routeData} transportProfile={transportProfile} />
          <div
            onClick={() => setSelectedId('itin-arrival')}
            className={`flex gap-4 p-4 rounded-2xl border transition-all ${selectedId === 'itin-arrival' ? 'bg-white border-rose-500 shadow-md ring-1 ring-rose-500' : 'bg-white border-gray-200 hover:border-slate-300'}`}
          >
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Bed className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest text-rose-500 uppercase mb-1">End Point</p>
              <div className="flex items-center gap-1.5">
                <input
                  value={endInput}
                  placeholder={activeItinerary.endAnchor?.title || "Where does your day end?"}
                  onChange={e => setEndInput(e.target.value)}
                  onFocus={e => { e.stopPropagation(); setEndInput(activeItinerary.endAnchor?.title || ''); (e.target as HTMLInputElement).select(); }}
                  onBlur={resolveEndInput}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); e.stopPropagation(); }}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none truncate transition-colors min-w-0"
                />
                <button
                  onClick={e => { e.stopPropagation(); const v = endInput.trim() || activeItinerary.endAnchor?.title || ''; if (v) { setAiPromptToTrigger(`My travel ends at ${v}`); setIsChatOpen(true); setEndInput(''); } }}
                  className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Ask concierge to find this place"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setMapClickMode('end'); }}
                  className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Click map to set end"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setAiPromptToTrigger("I want to change my end point"); setIsChatOpen(true); }}
                  title="Exchange end point"
                  className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
                {activeItinerary.endAnchor?.title && activeItinerary.endAnchor.title !== 'Destination' && (
                  <button
                    onClick={e => { e.stopPropagation(); clearEndAnchor(); setEndInput(''); }}
                    title="Remove end point"
                    className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {activeItinerary.endAnchor?.time && <p className="text-xs text-slate-500 mt-1">{activeItinerary.endAnchor.time}</p>}
            </div>
          </div>
          {/* Expandable detail — mirrors waypoint card pattern */}
          <div className={`grid transition-all duration-300 ease-in-out ${selectedId === 'itin-arrival' && (activeItinerary.endAnchor as any)?.service ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              {(activeItinerary.endAnchor as any)?.service && (
                <BusinessCard business={(activeItinerary.endAnchor as any).service} orientation="horizontal" />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
    </ItineraryErrorBoundary>
  );
}
