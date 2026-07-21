/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Component, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";
import { searchParamsParsers } from "../search-params";
import {
  useSelectionStore,
  useMapUiStore,
  useConciergeUiStore,
  usePanelStore,
} from "@/lib/store/use-ui-store"
import { useItineraryStore } from "@/lib/store/use-itinerary-store"
import { useMapboxRoute, type RouteData } from "@/features/discovery/hooks/use-mapbox-route"
import { useCallback } from "react"
import { saveItineraryAction, getItinerary, StopDrawer, StopDetailContent } from "@/features/itinerary";
import { explorePath, parseLocale } from "@/paths";
import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema";
import { getCategoryColor } from "@/lib/utils/category-style";
import { EndPointPicker } from "@/components/ui/end-point-picker";
import { Navigation, MapPin, Bed, Plane, X, ChevronDown, Trash2, ArrowUp, ArrowDown, Car, Footprints, AlertTriangle, Flag, Repeat, Plus, Share2, Copy, Check, Clock, ArrowRightLeft, Sparkles, Loader2, Utensils, Mountain } from "lucide-react";
import { BusinessCard } from "./business-card";
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
import { Button } from "@/components/ui/button"
import { DICTIONARIES } from "../constants";
import { Input } from "@/components/ui/input";
import type { TransportProfile } from "@/lib/store/use-itinerary-store";
import type { Business } from "@prisma/client";

function TransitEdge({ index, routeData, transportProfile, setTransportProfile, t }: { index: number; routeData: RouteData | null; transportProfile: TransportProfile; setTransportProfile: (index: number, p: TransportProfile) => void; t?: any }) {

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
            <Car className="w-3 h-3" /> {t?.drive || "Drive"}
          </button>
          <button 
            onClick={() => setTransportProfile(index, 'walking')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${!isDrive ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Footprints className="w-3 h-3" /> {t?.walk || "Walk"}
          </button>
        </div>
        <div className="flex justify-between items-center px-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {durationMin} min</span>
          <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {distanceKm} km</span>
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

export function ItineraryPanel({ dict }: {

  dict?: any
}) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [saveUrl, setSaveUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [loadingTripId, setLoadingTripId] = useState<string | null>(null);
  const [selectedDrawerStop, setSelectedDrawerStop] = useState<{
    business?: Business | null;
    title?: string;
    category?: string;
    description?: string;
    lat?: number;
    lng?: number;
    stopNumber?: number;
  } | null>(null);
  const [, setParams] = useQueryStates(searchParamsParsers);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeTab = useItineraryStore(s => s.activeTab);
  const setActiveTab = useItineraryStore(s => s.setActiveTab);
  const activeItinerary = useItineraryStore(s => s.activeTab === 'primary' ? s.activeItinerary : s.secondaryItinerary);
  const setActiveItinerary = useItineraryStore(s => s.setActiveItinerary);
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);
  const updateEndAnchorLocation = useItineraryStore(s => s.updateEndAnchorLocation);
  const removeWaypoint = useItineraryStore(s => s.removeWaypoint);
  const moveWaypoint = useItineraryStore(s => s.moveWaypoint);
  const moveToOtherItinerary = useItineraryStore(s => s.moveToOtherItinerary);
  const clearStartAnchor = useItineraryStore(s => s.clearStartAnchor);
  const clearEndAnchor = useItineraryStore(s => s.clearEndAnchor);
  const transportProfiles = useItineraryStore(s => s.transportProfiles);
  const setLegTransportProfile = useItineraryStore(s => s.setLegTransportProfile);

  const setPanelMode = usePanelStore(s => s.setPanelMode);
  const selectedId = useSelectionStore(s => s.selectedId);
  const setSelectedId = useSelectionStore(s => s.setSelectedId);
  const setExchangeTargetId = useSelectionStore(s => s.setExchangeTargetId);
  const setIsExchangingStart = useMapUiStore(s => s.setIsExchangingStart);
  const setIsExchangingEnd = useMapUiStore(s => s.setIsExchangingEnd);
  const setIsAddingStop = useMapUiStore(s => s.setIsAddingStop);
  const mapClickMode = useMapUiStore(s => s.mapClickMode);
  const setMapClickMode = useMapUiStore(s => s.setMapClickMode);
  const setMobileViewMode = useMapUiStore(s => s.setMobileViewMode);
  const setRadarState = useMapUiStore(s => s.setRadarState);
  const conciergeSendMessage = useConciergeUiStore(s => s.conciergeSendMessage);

  const { routeData } = useMapboxRoute();

  const handleSearchNearby = (e: React.MouseEvent, category: string, lat: number | undefined, lng: number | undefined, title: string | undefined, waypointId?: string) => {
    e.stopPropagation();
    if (!lat || !lng) return;
    
    setRadarState({
      waypointId: waypointId || 'itin-anchor',
      lat: lat,
      lng: lng,
      name: title || 'Location',
      category: category === 'dining' ? 'Dining' : category === 'stays' ? 'Stays' : 'Culture'
    });
    setPanelMode('discover');
    setMobileViewMode('map');
  };

  const handleLoadQuickStart = async (tripId: string) => {
    setLoadingTripId(tripId);
    try {
      const data = await getItinerary(tripId);
      if (data && data.success && data.state) {
        const state = data.state as any;
        let loadedItinerary;
        if (state && state.version === 2) {
          loadedItinerary = { ...state.primary, shortId: tripId };
          useItineraryStore.setState({ secondaryItinerary: state.secondary || null });
        } else if (state) {
          loadedItinerary = { ...(state as OptimizedPlan), shortId: tripId };
        }

        setActiveTab('primary');
        setActiveItinerary(loadedItinerary);

        setParams({ trip: tripId }, { shallow: true, scroll: false });
      }
    } catch (error) {
      console.error("Failed to load quick start trip:", error);
    } finally {
      setLoadingTripId(null);
    }
  };

  const saveItinerary = useCallback(async () => {
    const { activeItinerary: primary, secondaryItinerary: secondary } = useItineraryStore.getState();
    if (!primary && !secondary) return null;
    
    const stateToSave = {
      version: 2,
      primary,
      secondary
    };

    try {
      const data = await saveItineraryAction(stateToSave);
      if (data.success && data.data?.shortId) {
        setParams({ trip: data.data.shortId }, { shallow: true, scroll: false });
        return explorePath(parseLocale(pathname?.split("/")[1]), {
          trip: data.data.shortId,
        });
      }
    } catch (e) {
      console.error("Failed to save itinerary:", e);
    }
    return null;
  }, [pathname, setParams]);

  const isEs = pathname?.split('/')[1] === 'es';

  const t = (dict?.itineraryPanel || (isEs ? DICTIONARIES.itineraryPanelEs : DICTIONARIES.itineraryPanel));

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
    return (activeItinerary.waypoints || []).map((wp, i) => {
      const travelMins = routeData?.legs?.[i] ? Math.round(routeData.legs[i].duration / 60) : 0;
      cur += travelMins;
      const arrival = fmt(cur);
      cur += wp.durationMins || 60;
      return arrival;
    });
  })();

  if (!activeItinerary) {
    return (
      <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
        <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200 shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif font-semibold text-slate-900 truncate">
              {activeTab === 'primary' ? "Primary Route" : "Alternative Route"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPanelMode("discover")}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('primary')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'primary' ? 'border-b-2 border-slate-900 text-slate-900 bg-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
          >
            Primary Route
          </button>
          <button 
            onClick={() => setActiveTab('secondary')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'secondary' ? 'border-b-2 border-slate-900 text-slate-900 bg-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
          >
            Alternative Route
          </button>
        </div>

        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-white animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
            <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-50">
              <Navigation className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">Your Route is Empty</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            {activeTab === 'primary' 
              ? "Ask the UnlockCusco Concierge to \"plan a full day itinerary\" to see your route magically appear here."
              : "Move places from your Primary Route or browse Discover to add places to this Alternative Route."}
          </p>

          <div className="w-full max-w-sm mb-8 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Starts</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleLoadQuickStart('ultimate-inca-ruins')}
                disabled={loadingTripId !== null}
                className="px-4 py-3 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl text-sm font-semibold text-slate-700 hover:text-rose-600 transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Ultimate Inca Archeological Sites</span>
                {loadingTripId === 'ultimate-inca-ruins' ? (
                  <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              <button
                onClick={() => handleLoadQuickStart('top-7-culinary-route')}
                disabled={loadingTripId !== null}
                className="px-4 py-3 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl text-sm font-semibold text-slate-700 hover:text-rose-600 transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Top Culinary Route</span>
                {loadingTripId === 'top-7-culinary-route' ? (
                  <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              <button
                onClick={() => handleLoadQuickStart('maras-moray')}
                disabled={loadingTripId !== null}
                className="px-4 py-3 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl text-sm font-semibold text-slate-700 hover:text-rose-600 transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Maras & Moray Adventure</span>
                {loadingTripId === 'maras-moray' ? (
                  <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => setPanelMode("discover")}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Go to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <ItineraryErrorBoundary>
    <div className="relative flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
      {/* Desktop Detail Panel overlay */}
      {!isMobile && selectedDrawerStop && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col h-full animate-in fade-in slide-in-from-right duration-200">
          <StopDetailContent
            isEs={isEs}
            onClose={() => setSelectedDrawerStop(null)}
            business={selectedDrawerStop.business}
            title={selectedDrawerStop.title}
            category={selectedDrawerStop.category}
            description={selectedDrawerStop.description}
            lat={selectedDrawerStop.lat}
            lng={selectedDrawerStop.lng}
            stopNumber={selectedDrawerStop.stopNumber}
            onSearchNearby={(category) => {
              handleSearchNearby(
                { stopPropagation: () => {} } as any,
                category,
                selectedDrawerStop.lat ?? selectedDrawerStop.business?.lat ?? undefined,
                selectedDrawerStop.lng ?? selectedDrawerStop.business?.lng ?? undefined,
                selectedDrawerStop.title ?? selectedDrawerStop.business?.name ?? undefined,
                selectedDrawerStop.business?.id ?? undefined
              );
              setSelectedDrawerStop(null);
            }}
            onShowOnMap={() => {
              const activeId = selectedDrawerStop.business?.id || '';
              const activeLat = selectedDrawerStop.business?.lat ?? selectedDrawerStop.lat;
              const activeLng = selectedDrawerStop.business?.lng ?? selectedDrawerStop.lng;
              if (activeId && activeLat && activeLng) {
                setSelectedId(activeId);
                window.dispatchEvent(new CustomEvent('switch-to-map-view'));
                setMobileViewMode('map');
              }
              setSelectedDrawerStop(null);
            }}
            isInsideDrawer={false}
          />
        </div>
      )}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200 shrink-0 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-4">
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
              {activeItinerary.title || "My Sacred Valley Adventure"}
            </h2>
          </div>
          <button 
            onClick={() => setPanelMode("discover")}
            className="w-8 h-8 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-start sm:justify-end gap-2">
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="h-8 px-3 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
            title="Clear Itinerary"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
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
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-slate-50/50">
        <button 
          onClick={() => setActiveTab('primary')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'primary' ? 'border-b-2 border-slate-900 text-slate-900 bg-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
        >
          Primary Route
        </button>
        <button 
          onClick={() => setActiveTab('secondary')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'secondary' ? 'border-b-2 border-slate-900 text-slate-900 bg-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
        >
          Alternative Route
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 space-y-4 touch-pan-y overscroll-contain" data-vaul-no-drag>
        
        {/* Start Anchor */}
        <div 
          onClick={() => {
            setSelectedId('itin-start');
            if (activeItinerary.startAnchor && (activeItinerary.startAnchor.service || (activeItinerary.startAnchor.lat && activeItinerary.startAnchor.lng))) {
              setSelectedDrawerStop({
                business: activeItinerary.startAnchor.service as Business,
                title: activeItinerary.startAnchor.title,
                lat: activeItinerary.startAnchor.lat ?? undefined,
                lng: activeItinerary.startAnchor.lng ?? undefined
              });
            }
          }}
          className={`flex flex-col rounded-2xl border-l-4 border border-l-slate-900 transition-all cursor-pointer ${selectedId === 'itin-start' ? 'bg-white shadow-lg ring-1 ring-slate-900 scale-[1.01]' : 'bg-white shadow-md hover:shadow-xl border-slate-200/60'}`}
        >
          <div className="flex gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-inner">
              {activeItinerary.startAnchor?.type === 'AIRPORT' ? <Plane className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Start Point</p>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <p className="text-sm font-semibold text-slate-900 truncate flex-1">{activeItinerary.startAnchor?.title || "Current Location"}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3" onClick={e => e.stopPropagation()}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setStartAnchorLocation(pos.coords.latitude, pos.coords.longitude, "My Location");
                        setSelectedId('itin-start');
                        setMobileViewMode('map');
                        if (conciergeSendMessage) {
                          conciergeSendMessage({ text: `[INTERNAL] I just updated my start location to my current GPS location.` });
                        }
                      }, () => {
                        alert("Could not access your location. Please check browser permissions.");
                      });
                    } else {
                      alert("Geolocation is not supported by your browser.");
                    }
                  }}
                  className="shrink-0 h-8 px-2.5 sm:px-3 rounded-full bg-slate-100 flex items-center gap-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-[10px] font-bold uppercase tracking-wider"
                  title="Use My GPS Location"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Set GPS</span>
                </button>
                <button
                  onClick={e => { 
                    e.stopPropagation(); 
                    setMapClickMode('start');
                    setMobileViewMode('map');
                    window.dispatchEvent(new CustomEvent('drawer-snap-half'));
                  }}
                  className="shrink-0 h-8 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 transition-colors text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  title="Set marker on map"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.setMarker}</span>
                  <span className="sm:hidden">Marker</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setIsExchangingStart(true); setPanelMode('discover'); }}
                  title={activeItinerary.startAnchor?.title && activeItinerary.startAnchor.title !== 'Current Location' ? "Exchange start point — browse Discover" : "Add start point — browse Discover"}
                  className="shrink-0 h-8 px-2.5 sm:px-3 rounded-full bg-slate-100 flex items-center gap-1.5 text-slate-400 hover:bg-slate-200 transition-colors text-[10px] font-bold uppercase tracking-wider"
                >
                  {activeItinerary.startAnchor?.title && activeItinerary.startAnchor.title !== 'Current Location' ? <Repeat className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  <span className="hidden sm:inline">{activeItinerary.startAnchor?.title && activeItinerary.startAnchor.title !== 'Current Location' ? 'Exchange' : 'Add'}</span>
                  <span className="sm:hidden">{activeItinerary.startAnchor?.title && activeItinerary.startAnchor.title !== 'Current Location' ? 'Swap' : 'Add'}</span>
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
                    className="w-10 h-10 rounded-full text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: getCategoryColor(waypoint.category) }}
                    onClick={() => {
                      setSelectedId(waypoint.id);
                      setSelectedDrawerStop({
                        business: waypoint.service as Business,
                        title: waypoint.title,
                        category: waypoint.category,
                        description: "Description not available.",
                        lat: waypoint.lat ?? undefined,
                        lng: waypoint.lng ?? undefined,
                        stopNumber: idx + 1
                      });
                    }}
                  >
                    {idx + 1}
                  </div>
                  
                  <div 
                    className="flex-1 cursor-pointer select-none"
                    onClick={() => {
                      setSelectedId(waypoint.id);
                      setSelectedDrawerStop({
                        business: waypoint.service as Business,
                        title: waypoint.title,
                        category: waypoint.category,
                        description: "Description not available.",
                        lat: waypoint.lat ?? undefined,
                        lng: waypoint.lng ?? undefined,
                        stopNumber: idx + 1
                      });
                    }}
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
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{isEs && (waypoint.service as Business)?.nameEs ? (waypoint.service as Business).nameEs : waypoint.title}</p>
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

                {/* Action Footer: Delete, Swap, Move, End Here */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger render={
                        <button 
                          onClick={(e) => { e.stopPropagation(); }}
                          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 h-8 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-[10px] font-bold uppercase tracking-wider"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t.delete}</span>
                        </button>
                      } />
                      <DialogContent className="sm:max-w-md border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white p-6 pb-2 relative overflow-hidden">
                          <DialogHeader className="relative z-10 space-y-2">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                              <Trash2 className="w-6 h-6 text-rose-600" />
                            </div>
                            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">{t.removeStop}</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm leading-relaxed mt-2">
                              {t.areYouSure} <strong>{waypoint.title}</strong> {t.fromItinerary}
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                        <div className="p-6 pt-4 bg-white space-y-3">
                          <div className="flex flex-col gap-2">
                            <DialogClose render={
                              <Button className="bg-rose-600 text-white hover:bg-rose-700 text-sm font-medium h-11 rounded-xl w-full" onClick={(e) => { e.stopPropagation(); removeWaypoint(waypoint.id); }}>
                                {t.remove}
                              </Button>
                            } />
                            <DialogClose render={
                              <Button variant="ghost" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm font-medium h-11 rounded-xl w-full">
                                {t.cancel}
                              </Button>
                            } />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <button
                      onClick={e => { e.stopPropagation(); setExchangeTargetId?.(waypoint.id); setPanelMode('discover'); }}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 h-8 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors text-[10px] font-bold uppercase tracking-wider"
                      title={t.swap}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.swap}</span>
                    </button>

                    <Dialog>
                      <DialogTrigger render={
                        <button
                          onClick={e => { e.stopPropagation(); }}
                          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 h-8 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-[10px] font-bold uppercase tracking-wider"
                          title={activeTab === 'primary' ? "Move to Alternative Route" : "Move to Primary Route"}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t.move || "Move"}</span>
                        </button>
                      } />
                      <DialogContent className="sm:max-w-md border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white p-6 pb-2 relative overflow-hidden">
                          <DialogHeader className="relative z-10 space-y-2">
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                              <ArrowRightLeft className="w-6 h-6 text-indigo-600" />
                            </div>
                            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">{t.moveStop}</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm leading-relaxed mt-2">
                              {t.areYouSureMove} <strong>{waypoint.title}</strong> {t.toOtherItinerary}
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                        <div className="p-6 pt-4 bg-white space-y-3">
                          <div className="flex flex-col gap-2">
                            <DialogClose render={
                              <Button className="bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium h-11 rounded-xl w-full" onClick={(e) => { e.stopPropagation(); moveToOtherItinerary(waypoint.id); }}>
                                {t.move || "Move"}
                              </Button>
                            } />
                            <DialogClose render={
                              <Button variant="ghost" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm font-medium h-11 rounded-xl w-full">
                                {t.cancel}
                              </Button>
                            } />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {waypoint.lat != null && waypoint.lng != null && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateEndAnchorLocation(waypoint.lat!, waypoint.lng!, waypoint.title, waypoint.service as Business);
                          if (conciergeSendMessage) {
                            conciergeSendMessage({ text: `[INTERNAL] I just updated my end location to ${waypoint.title}.` });
                          }
                          removeWaypoint(waypoint.id);
                        }}
                        title={t.endHere}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 h-8 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-[10px] font-bold uppercase tracking-wider"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t.endHere}</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(waypoint.id);
                      setSelectedDrawerStop({
                        business: waypoint.service as Business,
                        title: waypoint.title,
                        category: waypoint.category,
                        description: "Description not available.",
                        lat: waypoint.lat ?? undefined,
                        lng: waypoint.lng ?? undefined,
                        stopNumber: idx + 1
                      });
                    }}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ml-1 rounded-full hover:bg-slate-50"
                  >
                    <ChevronDown className="w-5 h-5 -rotate-90" />
                  </button>
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
             <Plus className="w-4 h-4" /> {t.addStop}
           </button>
        </div>

        {/* End Anchor */}
        <div className="relative">
          <TransitEdge index={(activeItinerary.waypoints || []).length} routeData={routeData} transportProfile={transportProfiles[(activeItinerary.waypoints || []).length] || 'driving'} setTransportProfile={setLegTransportProfile} t={t} />
          <div 
            onClick={() => {
              setSelectedId('itin-arrival');
              if (activeItinerary.endAnchor && (activeItinerary.endAnchor.service || (activeItinerary.endAnchor.lat && activeItinerary.endAnchor.lng))) {
                setSelectedDrawerStop({
                  business: activeItinerary.endAnchor.service as Business,
                  title: activeItinerary.endAnchor.title,
                  lat: activeItinerary.endAnchor.lat ?? undefined,
                  lng: activeItinerary.endAnchor.lng ?? undefined
                });
              }
            }}
            className={`flex flex-col rounded-2xl border-l-4 border border-l-rose-600 transition-all cursor-pointer ${selectedId === 'itin-arrival' ? 'bg-white shadow-lg ring-1 ring-rose-500 scale-[1.01]' : 'bg-white shadow-md hover:shadow-xl border-slate-200/60'}`}
          >
            <div className="flex gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Bed className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-widest text-rose-500 uppercase mb-1">{t.endPoint}</p>
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <EndPointPicker
                    value={activeItinerary.endAnchor?.title}
                    placeholder={t.endPlaceholder}
                    onSelect={({ lat, lng, name, service }) => {
                      updateEndAnchorLocation(lat, lng, name, service);
                      if (conciergeSendMessage) {
                        conciergeSendMessage({ text: `[INTERNAL] I just updated my end location to ${name}.` });
                      }
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          updateEndAnchorLocation(pos.coords.latitude, pos.coords.longitude, "My Location");
                          setSelectedId('itin-arrival');
                          setMobileViewMode('map');
                          if (conciergeSendMessage) {
                            conciergeSendMessage({ text: `[INTERNAL] I just updated my end location to my current GPS location.` });
                          }
                        }, () => {
                          alert("Could not access your location. Please check browser permissions.");
                        });
                      } else {
                        alert("Geolocation is not supported by your browser.");
                      }
                    }}
                    className="shrink-0 h-8 px-2.5 sm:px-3 rounded-full bg-slate-100 flex items-center gap-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-[10px] font-bold uppercase tracking-wider"
                    title="Use My GPS Location"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Set GPS</span>
                  </button>
                  <button
                    onClick={e => { 
                      e.stopPropagation(); 
                      setMapClickMode('end');
                      setMobileViewMode('map');
                      window.dispatchEvent(new CustomEvent('drawer-snap-half'));
                    }}
                    className="shrink-0 h-8 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 transition-colors text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    title="Set marker on map"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.setMarker}</span>
                    <span className="sm:hidden">Marker</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setIsExchangingEnd(true); setPanelMode('discover'); }}
                    title={activeItinerary.endAnchor?.title && activeItinerary.endAnchor.title !== 'Destination' ? "Exchange end point — browse Discover" : "Add end point — browse Discover"}
                    className="shrink-0 h-8 px-2.5 sm:px-3 rounded-full bg-slate-100 flex items-center gap-1.5 text-slate-400 hover:bg-slate-200 transition-colors text-[10px] font-bold uppercase tracking-wider"
                  >
                    {activeItinerary.endAnchor?.title && activeItinerary.endAnchor.title !== 'Destination' ? <Repeat className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    <span className="hidden sm:inline">{activeItinerary.endAnchor?.title && activeItinerary.endAnchor.title !== 'Destination' ? 'Exchange' : 'Add'}</span>
                    <span className="sm:hidden">{activeItinerary.endAnchor?.title && activeItinerary.endAnchor.title !== 'Destination' ? 'Swap' : 'Add'}</span>
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
                  const waypoints = activeItinerary.waypoints || [];
                  if (stopTimes.length > 0 || routeData?.legs) {
                    const lastStopMins = (() => {
                      const parseTime = (t: string | undefined) => { if (!t) return 9*60; const [h,m]=t.split(':').map(Number); return (h||0)*60+(m||0); };
                      let cur = parseTime(activeItinerary.startAnchor?.time);
                      waypoints.forEach((wp, i: number) => {
                        cur += routeData?.legs?.[i] ? Math.round(routeData.legs[i].duration/60) : 0;
                        cur += wp.durationMins || 60;
                      });
                      const lastLeg = routeData?.legs?.[waypoints.length];
                      if (lastLeg) cur += Math.round(lastLeg.duration/60);
                      const h = Math.floor(cur/60)%24; const m = cur%60;
                      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                    })();
                    return <p className="text-[10px] font-bold text-rose-400 mt-1">⏱ {(t as any).arrives} ~{lastStopMins}</p>;
                  }
                  return activeItinerary.endAnchor?.time ? <p className="text-xs text-slate-500 mt-1">{activeItinerary.endAnchor.time}</p> : null;
                })()}
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
              <DialogTitle className="text-2xl font-serif tracking-tight text-white">{t.routeSaved}</DialogTitle>
              <DialogDescription className="text-slate-300 text-sm leading-relaxed">
                {t.routeSavedDesc}
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
                    <Check className="w-3.5 h-3.5" /> {t.copied}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> {t.copy}
                  </>
                )}
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button onClick={() => setIsSaveModalOpen(false)} variant="ghost" className="text-slate-500 hover:text-slate-900 text-sm font-medium w-full sm:w-auto h-11 rounded-xl">
                {t.close}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isClearModalOpen} onOpenChange={setIsClearModalOpen}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-white p-6 pb-2 relative overflow-hidden">
            <DialogHeader className="relative z-10 space-y-2">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">Clear Itinerary</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm leading-relaxed mt-2">
                Are you sure you want to clear the itinerary &quot;{activeItinerary?.title || "My Sacred Valley Adventure"}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 pt-4 bg-white space-y-4">
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                onClick={() => setIsClearModalOpen(false)}
                variant="outline"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200 text-sm font-medium w-full sm:w-auto h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setActiveItinerary(null);
                  setParams({ trip: null }, { shallow: true, scroll: false });
                  setIsClearModalOpen(false);
                }}
                className="bg-rose-600 text-white hover:bg-rose-700 text-sm font-medium w-full sm:w-auto h-11 rounded-xl"
              >
                Clear Route
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vault Drawer for stop details on mobile */}
      {isMobile && selectedDrawerStop && (
        <StopDrawer
          isOpen={!!selectedDrawerStop}
          onClose={() => setSelectedDrawerStop(null)}
          isEs={isEs}
          business={selectedDrawerStop.business}
          title={selectedDrawerStop.title}
          category={selectedDrawerStop.category}
          description={selectedDrawerStop.description}
          lat={selectedDrawerStop.lat}
          lng={selectedDrawerStop.lng}
          stopNumber={selectedDrawerStop.stopNumber}
          onSearchNearby={(category) => {
            handleSearchNearby(
              { stopPropagation: () => {} } as any,
              category,
              selectedDrawerStop.lat ?? selectedDrawerStop.business?.lat ?? undefined,
              selectedDrawerStop.lng ?? selectedDrawerStop.business?.lng ?? undefined,
              selectedDrawerStop.title ?? selectedDrawerStop.business?.name ?? undefined,
              selectedDrawerStop.business?.id ?? undefined
            );
            setSelectedDrawerStop(null);
          }}
          onShowOnMap={() => {
            const activeId = selectedDrawerStop.business?.id || '';
            const activeLat = selectedDrawerStop.business?.lat ?? selectedDrawerStop.lat;
            const activeLng = selectedDrawerStop.business?.lng ?? selectedDrawerStop.lng;
            if (activeId && activeLat && activeLng) {
              setSelectedId(activeId);
              window.dispatchEvent(new CustomEvent('switch-to-map-view'));
              setMobileViewMode('map');
            }
            setSelectedDrawerStop(null);
          }}
        />
      )}
    </ItineraryErrorBoundary>
  );
}
