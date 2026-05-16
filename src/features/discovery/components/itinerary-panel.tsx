"use client";

import { useState, Component, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTrip } from "@/lib/store/trip-context";
import { usePreferences } from "@/lib/store/preferences-context";
import { getCategoryColor } from "@/lib/utils/category-style";
import { EndPointPicker } from "@/components/ui/EndPointPicker";
import { Navigation, MapPin, Bed, Plane, ArrowRight, X, ChevronDown, ChevronUp, GripVertical, Trash2, ArrowUp, ArrowDown, Car, Footprints, MessageCircle, AlertTriangle, Flag, Repeat, Plus, Share2, Copy, Check } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import type { RouteData, TransportProfile } from "@/lib/store/trip-context";

// Stable component outside ItineraryPanel so React fiber identity is preserved across re-renders
function TransitEdge({ index, routeData, transportProfile, setTransportProfile }: { index: number; routeData: RouteData | null; transportProfile: TransportProfile; setTransportProfile: (index: number, p: TransportProfile) => void }) {
  const leg = routeData?.legs?.[index];
  if (!leg) return (
    <div className="relative h-12 w-full flex items-center">
      <div className="absolute left-[35px] top-0 bottom-0 w-[2px] bg-slate-200" />
    </div>
  );
  
  const durationMin = Math.round(leg.duration / 60);
  const distanceKm = +(leg.distance / 1000).toFixed(1);
  const isDrive = transportProfile === 'driving';

  return (
    <div className="relative py-2 w-full flex items-center">
      <div className="absolute left-[35px] top-0 bottom-0 w-[2px] bg-slate-300" />
      <div className="ml-[72px] w-[220px] bg-white border border-slate-200 shadow-sm rounded-xl p-1.5 flex flex-col gap-1.5 z-10 relative">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg">
          <button 
            onClick={() => setTransportProfile(index, 'driving')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${isDrive ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Car className="w-3 h-3" /> Drive
          </button>
          <button 
            onClick={() => setTransportProfile(index, 'walking')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${!isDrive ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Footprints className="w-3 h-3" /> Walk
          </button>
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-semibold text-slate-600 tracking-tight">{durationMin}m ({distanceKm}km)</span>
          <span className="text-[10px] font-bold text-emerald-600 whitespace-nowrap text-right">
            {isDrive ? `Taxi: ~S/ ${Math.max(5, Math.round(distanceKm * 2.5))} • Bus: ~S/ ${Math.max(2, Math.round(distanceKm * 0.4))}` : 'Free'}
          </span>
        </div>
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
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveUrl, setSaveUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const {
    activeItinerary,
    setPanelMode,
    selectedId,
    setSelectedId,
    exchangeTargetId,
    setExchangeTargetId,
    removeWaypoint,
    moveWaypoint,
    setWaypoints,
    routeData,
    transportProfiles,
    setLegTransportProfile,
    updateEndAnchorLocation,
    mapClickMode,
    setMapClickMode,
    setAiPromptToTrigger,
    clearStartAnchor,
    clearEndAnchor,
    setStartAnchorLocation,
    setIsExchangingStart,
    setIsExchangingEnd,
    setIsAddingStop,
    saveItinerary,
  } = useTrip();
  const { setIsChatOpen } = usePreferences();
  const router = useRouter();

  // Cascade stop times: startAnchor time + legs travel + waypoint durations
  const stopTimes = (() => {
    if (!activeItinerary) return [];
    const parseTime = (t: string | undefined): number => {
      if (!t) return 9 * 60; // default 09:00
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const fmt = (mins: number): string => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    let cur = parseTime(activeItinerary.startAnchor?.time);
    return (activeItinerary.waypoints || []).map((wp: any, i: number) => {
      const travelMins = routeData?.legs?.[i] ? Math.round(routeData.legs[i].duration / 60) : 0;
      cur += travelMins;
      const arrival = fmt(cur);
      cur += wp.durationMins || 60;
      return arrival;
    });
  })();

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
            {activeItinerary.title || "Itinerary"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const url = await saveItinerary();
              if (url) {
                setSaveUrl(url);
                setIsSaveModalOpen(true);
              }
            }}
            className="h-8 px-3 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Save
          </button>
          <button 
            onClick={() => setPanelMode("discover")}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 space-y-4 touch-pan-y overscroll-contain" data-vaul-no-drag>
        
        {/* Start Anchor */}
        <div 
          onClick={() => setSelectedId('itin-start')}
          className={`flex flex-col rounded-2xl border-l-4 border border-l-slate-900 transition-all ${selectedId === 'itin-start' ? 'bg-white shadow-lg ring-1 ring-slate-900 scale-[1.01]' : 'bg-white shadow-md hover:shadow-xl border-slate-200/60'}`}
        >          <div className="flex gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-inner">
              {activeItinerary.startAnchor?.type === 'AIRPORT' ? <Plane className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Start Point</p>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <p className="text-sm font-semibold text-slate-900 truncate flex-1">{activeItinerary.startAnchor?.title || "Current Location"}</p>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setStartAnchorLocation(pos.coords.latitude, pos.coords.longitude, "My Location");
                      }, (err) => {
                        alert("Could not access your location. Please check browser permissions.");
                      });
                    } else {
                      alert("Geolocation is not supported by your browser.");
                    }
                  }}
                  className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  title="Use My GPS Location"
                >
                  <Navigation className="w-4 h-4" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setSelectedId('itin-start'); window.dispatchEvent(new CustomEvent('drawer-snap-half')); }}
                  className="shrink-0 h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  View Map
                </button>
                <button
                  onClick={e => { 
                    e.stopPropagation(); 
                    if (mapClickMode === 'start') {
                      setMapClickMode(null);
                    } else {
                      setMapClickMode('start');
                      window.dispatchEvent(new CustomEvent('drawer-snap-half'));
                    }
                  }}
                  className={`shrink-0 h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors text-[10px] font-bold uppercase tracking-wider ${mapClickMode === 'start' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mapClickMode === 'start' ? 'Cancel' : 'Set Marker'}</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setIsExchangingStart(true); setPanelMode('discover'); }}
                  title={activeItinerary.startAnchor?.title && activeItinerary.startAnchor.title !== 'Current Location' ? "Exchange start point — browse Discover" : "Add start point — browse Discover"}
                  className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                >
                  {activeItinerary.startAnchor?.title && activeItinerary.startAnchor.title !== 'Current Location' ? <Repeat className="w-4 h-4" /> : <Plus className="w-4 h-4" strokeWidth={1.5} />}
                </button>
                {activeItinerary.startAnchor?.title && activeItinerary.startAnchor.title !== 'Current Location' && (
                  <button
                    onClick={e => { e.stopPropagation(); clearStartAnchor(); setIsExchangingStart(false); }}
                    title="Remove start point"
                    className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {activeItinerary.startAnchor?.time && <p className="text-[10px] font-bold text-slate-500 mt-1">⏱ Departure {activeItinerary.startAnchor.time}</p>}
            </div>
          </div>
          {/* Expandable detail — inside border container, mirrors waypoint card */}
          <div className={`grid transition-all duration-300 ease-in-out ${selectedId === 'itin-start' && (activeItinerary.startAnchor as any)?.service ? "grid-rows-[1fr] opacity-100 px-4 pb-4 pt-0 border-t border-gray-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              {(activeItinerary.startAnchor as any)?.service && (
                <BusinessCard business={(activeItinerary.startAnchor as any).service} orientation="horizontal" showItineraryAdd={false} showItineraryEnd={false} />
              )}
            </div>
          </div>
        </div>

        {/* Waypoints */}
        <div className="relative w-full">
          {(activeItinerary.waypoints || []).map((waypoint, idx) => (
            <div key={`${waypoint.id}-${idx}`} id={`${waypoint.id}-${idx}`} className="relative">
              <TransitEdge index={idx} routeData={routeData} transportProfile={transportProfiles[idx] || 'driving'} setTransportProfile={setLegTransportProfile} />
              
              <div
                className={`flex flex-col p-4 rounded-2xl border-l-4 border mb-2 border-l-[var(--step-color)] transition-all ${selectedId === waypoint.id ? 'bg-white shadow-lg ring-1 ring-[var(--step-color)] scale-[1.01]' : 'bg-white shadow-md hover:shadow-xl border-slate-200/60'}`}
                style={{ '--step-color': getCategoryColor(waypoint.category) } as React.CSSProperties}
              >
                <div className="flex gap-3 items-start">
                  <div
                    className="w-10 h-10 rounded-full text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md"
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
                      <div className="flex items-center gap-1.5">
                        {stopTimes[idx] && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-full">
                            ⏱ {stopTimes[idx]}
                          </span>
                        )}
                        {waypoint.durationMins && (
                          <span className="text-[10px] text-slate-400">
                            {waypoint.durationMins}m
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{waypoint.title}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {waypoint.locationStr}</p>
                  </div>

                  {/* Top-Right Actions: Up/Down Group */}
                  <div className="flex flex-col gap-1 shrink-0 ml-1">
                    <button 
                      disabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); moveWaypoint(waypoint.id, "up"); }}
                      className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      disabled={idx === (activeItinerary.waypoints || []).length - 1}
                      onClick={(e) => { e.stopPropagation(); moveWaypoint(waypoint.id, "down"); }}
                      className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Footer: Delete, Swap, End Point */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger render={
                        <button 
                          onClick={(e) => { e.stopPropagation(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-[10px] font-bold uppercase tracking-wider"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
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
                    
                    <button
                      onClick={e => { e.stopPropagation(); setExchangeTargetId?.(waypoint.id); setPanelMode('discover'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors text-[10px] font-bold uppercase tracking-wider"
                      title="Exchange this place"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      Swap
                    </button>

                    {waypoint.lat != null && waypoint.lng != null && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateEndAnchorLocation(waypoint.lat!, waypoint.lng!, waypoint.title, waypoint.service);
                          removeWaypoint(waypoint.id);
                        }}
                        title="Set as end of trip"
                        className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-[10px] font-bold uppercase tracking-wider"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        End Here
                      </button>
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedId(selectedId === waypoint.id ? null : waypoint.id); }}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ml-1 rounded-full hover:bg-slate-50"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${selectedId === waypoint.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Expandable Section with CSS Grid Transition */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${selectedId === waypoint.id ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    {waypoint.service && (
                      <BusinessCard business={waypoint.service} mapTargetId={waypoint.id} orientation="horizontal" showItineraryAdd={false} showItineraryEnd={false} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Stop Block */}
        <div className="relative flex justify-center pt-2 pb-6">
           <button 
             onClick={() => { setSelectedId(null); setIsAddingStop(true); setPanelMode('discover'); }} 
             className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm border border-slate-200 border-dashed hover:border-slate-300 hover:shadow"
           >
             <Plus className="w-4 h-4" /> Add Stop
           </button>
        </div>

        {/* End Anchor */}
        <div className="relative">
          <TransitEdge index={(activeItinerary.waypoints || []).length} routeData={routeData} transportProfile={transportProfiles[(activeItinerary.waypoints || []).length] || 'driving'} setTransportProfile={setLegTransportProfile} />
          <div 
            onClick={() => setSelectedId('itin-arrival')}
            className={`flex flex-col rounded-2xl border-l-4 border border-l-rose-600 transition-all ${selectedId === 'itin-arrival' ? 'bg-white shadow-lg ring-1 ring-rose-500 scale-[1.01]' : 'bg-white shadow-md hover:shadow-xl border-slate-200/60'}`}
          >
            <div className="flex gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Bed className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest text-rose-500 uppercase mb-1">End Point</p>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <EndPointPicker
                  value={activeItinerary.endAnchor?.title}
                  placeholder="Where does your day end?"
                  onSelect={({ lat, lng, name, service }) => updateEndAnchorLocation(lat, lng, name, service)}
                />
                <button
                  onClick={e => { e.stopPropagation(); setSelectedId('itin-arrival'); window.dispatchEvent(new CustomEvent('drawer-snap-half')); }}
                  className="shrink-0 h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  View Map
                </button>
                <button
                  onClick={e => { 
                    e.stopPropagation(); 
                    if (mapClickMode === 'end') {
                      setMapClickMode(null);
                    } else {
                      setMapClickMode('end');
                      window.dispatchEvent(new CustomEvent('drawer-snap-half'));
                    }
                  }}
                  className={`shrink-0 h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors text-[10px] font-bold uppercase tracking-wider ${mapClickMode === 'end' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mapClickMode === 'end' ? 'Cancel' : 'Set Marker'}</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setIsExchangingEnd(true); setPanelMode('discover'); }}
                  title={activeItinerary.endAnchor?.title && activeItinerary.endAnchor.title !== 'Destination' ? "Exchange end point — browse Discover" : "Add end point — browse Discover"}
                  className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                >
                  {activeItinerary.endAnchor?.title && activeItinerary.endAnchor.title !== 'Destination' ? <Repeat className="w-4 h-4" /> : <Plus className="w-4 h-4" strokeWidth={1.5} />}
                </button>
                {activeItinerary.endAnchor?.title && activeItinerary.endAnchor.title !== 'Destination' && (
                  <button
                    onClick={e => { e.stopPropagation(); clearEndAnchor(); setIsExchangingEnd(false); }}
                    title="Remove end point"
                    className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {(() => {
                // End arrival = last stop time + last stop duration + last leg travel
                const waypoints = activeItinerary.waypoints || [];
                if (stopTimes.length > 0 || routeData?.legs) {
                  const lastStopMins = (() => {
                    const parseTime = (t: string | undefined) => { if (!t) return 9*60; const [h,m]=t.split(':').map(Number); return (h||0)*60+(m||0); };
                    let cur = parseTime(activeItinerary.startAnchor?.time);
                    waypoints.forEach((wp: any, i: number) => {
                      cur += routeData?.legs?.[i] ? Math.round(routeData.legs[i].duration/60) : 0;
                      cur += wp.durationMins || 60;
                    });
                    const lastLeg = routeData?.legs?.[waypoints.length];
                    if (lastLeg) cur += Math.round(lastLeg.duration/60);
                    const h = Math.floor(cur/60)%24; const m = cur%60;
                    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                  })();
                  return <p className="text-[10px] font-bold text-rose-400 mt-1">⏱ Arrives ~{lastStopMins}</p>;
                }
                return activeItinerary.endAnchor?.time ? <p className="text-xs text-slate-500 mt-1">{activeItinerary.endAnchor.time}</p> : null;
              })()}
            </div>
            </div>
            {/* Expandable detail — inside border container, mirrors waypoint card */}
            <div className={`grid transition-all duration-300 ease-in-out ${selectedId === 'itin-arrival' && (activeItinerary.endAnchor as any)?.service ? "grid-rows-[1fr] opacity-100 px-4 pb-4 pt-0 border-t border-gray-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                {(activeItinerary.endAnchor as any)?.service && (
                  <BusinessCard business={(activeItinerary.endAnchor as any).service} orientation="horizontal" showItineraryAdd={false} showItineraryEnd={false} showMap={false} />
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 pb-8 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <DialogHeader className="relative z-10 space-y-2">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
                <Share2 className="w-6 h-6 text-emerald-400" />
              </div>
              <DialogTitle className="text-2xl font-serif tracking-tight text-white">Route Saved! 🎉</DialogTitle>
              <DialogDescription className="text-slate-300 text-sm leading-relaxed">
                Your Vallecito journey is safely stored. Anyone with this magic link can view your route on any device.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 relative">
              <Input
                readOnly
                value={saveUrl}
                className="pr-24 bg-slate-50 border-slate-200 text-slate-700 h-12 font-mono text-xs focus-visible:ring-emerald-500 shadow-inner rounded-xl"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(saveUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className={`absolute right-1.5 top-1.5 bottom-1.5 h-9 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 px-3 ${
                  isCopied
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button onClick={() => setIsSaveModalOpen(false)} variant="ghost" className="text-slate-500 hover:text-slate-900 text-sm font-medium w-full sm:w-auto h-11 rounded-xl">
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </ItineraryErrorBoundary>
  );
}
