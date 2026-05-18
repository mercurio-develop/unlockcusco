"use client"

import { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CATEGORIES, LOCATIONS } from "../constants"
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl, useControl } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Star, Zap, Layers, Navigation, Utensils, Sprout, Mountain as MountainIcon, Bed, Landmark, Ticket, MapPin, Plane, Car, Clipboard, Scissors, User, Sparkles, Clock, X, ChevronDown, ChevronRight, ChevronUp, Check, Bot } from "lucide-react"
import type { Business } from "@prisma/client"
import { useTrip } from "@/lib/store/trip-context"
import { usePreferences } from "@/lib/store/preferences-context"
import { cn } from "@/lib/utils"
import { BusinessCard } from "./business-card"
import useSupercluster from "use-supercluster"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getCategoryColor } from "@/lib/utils/category-style";

const DAY_COLORS = ["#007AFF", "#FF9500", "#34C759", "#AF52DE", "#FF2D55", "#5856D6"];

const getCategoryStyle = (category: string | undefined | null) => {
  const bg = getCategoryColor(category);
  if (!category) return { bg, icon: MapPin };
  const cat = category.toUpperCase();
  switch (cat) {
    case 'DINING':
    case 'MEAL':      return { bg, icon: Utensils };
    case 'WELLNESS':  return { bg, icon: Sprout };
    case 'ADVENTURE': return { bg, icon: MountainIcon };
    case 'STAYS':
    case 'STAY':      return { bg, icon: Bed };
    case 'CULTURE':   return { bg, icon: Landmark };
    case 'SPIRITUAL': return { bg, icon: Sparkles };
    case 'BOLETO':    return { bg, icon: Ticket };
    case 'TRANSPORT': return { bg, icon: Car };
    case 'AGENCY':
    case 'EXPERIENCE':return { bg, icon: Star };
    case 'TEXTILES':  return { bg, icon: Scissors };
    case 'GUIDE':     return { bg, icon: User };
    case 'NOTE':      return { bg, icon: Clipboard };
    default:          return { bg, icon: MapPin };
  }
}

function StyleSwitcherControl({ mapMode, setMapMode }: { mapMode: string, setMapMode: (mode: "satellite" | "planning") => void }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useControl(
    () => {
      const ctrl = document.createElement('div');
      ctrl.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      return {
        onAdd: () => {
          setContainer(ctrl);
          return ctrl;
        },
        onRemove: () => {
          ctrl.parentNode?.removeChild(ctrl);
          setContainer(null);
        }
      };
      },
      { position: 'top-right' }
      );

      if (!container) return null;

  return createPortal(
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setMapMode(mapMode === "satellite" ? "planning" : "satellite");
      }}
      className="w-[29px] h-[29px] flex items-center justify-center bg-transparent hover:bg-black/5 transition-colors rounded-none outline-none border-none cursor-pointer"
      title={mapMode === "satellite" ? "Switch to Map" : "Switch to Satellite"}
    >
      {mapMode === "satellite" ? <Layers className="w-[18px] h-[18px] text-[#333] ml-[6px]" /> : <Navigation className="w-[18px] h-[18px] text-[#333] ml-[6px]" />}
    </button>,
    container
  );
}

function CategoryClusterLayer({ category, businesses, bounds, zoom, mapRef, selectedId, setPopupBusiness, onSelectBusiness, panelMode, isMobile }: any) {
  const points = useMemo(() => {
    return businesses.map((business: any) => ({
      type: "Feature" as const,
      properties: { cluster: false, businessId: business.id, category: business.category, business },
      geometry: { type: "Point" as const, coordinates: [business.lng, business.lat] }
    }));
  }, [businesses]);

  // Expand bounds by 50% to prevent edge-clipping markers and allow smooth panning on mobile
  const paddedBounds = useMemo(() => {
    if (!bounds) return undefined;
    const [west, south, east, north] = bounds;
    const lngPad = (east - west) * 0.5;
    const latPad = (north - south) * 0.5;
    return [west - lngPad, south - latPad, east + lngPad, north + latPad] as [number, number, number, number];
  }, [bounds]);

  const clusterOptions = useMemo(() => ({
    radius: isMobile ? 30 : 60,
    maxZoom: 12
  }), [isMobile]);

  const { clusters, supercluster } = useSupercluster({
    points: points,
    bounds: paddedBounds,
    zoom: Math.min(Math.round(zoom), 19),
    options: clusterOptions
  });

  const style = getCategoryStyle(category);
  const Icon = style.icon;

  const displayItems = useMemo(() => {
    return clusters;
  }, [clusters]);

  return (
    <>
      {displayItems.map((item: any, index: number) => {
        const [longitude, latitude] = item.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount, business, businessId } = item.properties;

        if (isCluster) {
          return (
            <Marker pitchAlignment="viewport"
              key={`cluster-${category}-${item.id}`}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                const expansionZoom = supercluster?.getClusterExpansionZoom(item.id);
                if (expansionZoom && expansionZoom > 19 && supercluster) {
                  const leaves = supercluster.getLeaves(item.id, Infinity);
                  const clusterBusinesses = leaves.map((l: any) => l.properties.business);
                  setPopupBusiness({ isClusterPopup: true, businesses: clusterBusinesses, lat: latitude, lng: longitude } as any);
                } else {
                  mapRef.current?.flyTo({
                    center: [longitude, latitude],
                    zoom: Math.min(expansionZoom ?? 20, 20),
                    duration: 1000,
                    offset: [0, isMobile ? 220 : 150]
                  });
                }
              }}
            >
              <div className="cursor-pointer transition-all duration-300 relative flex flex-col items-center hover:scale-110" style={{ zIndex: 20 }}>
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-2 border-white z-20 shadow-md">
                  {pointCount}
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-[2px] rounded-full" />
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-[2.5px] border-white transition-all"
                  style={{ backgroundColor: style.bg }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="w-1.5 h-1.5 -mt-1 rotate-45 border-r-[2.5px] border-b-[2.5px] border-white" style={{ backgroundColor: style.bg }} />
              </div>
            </Marker>
          );
        }

        const bId = businessId || item.properties.businessId;
        const bData = business || item.properties.business;
        const isSelected = selectedId === bId;
        
        const isConciergeResult = bData.isConciergeResult;
        const markerBg = isConciergeResult ? "#6366F1" : style.bg; // Indigo for AI
        const MarkerIcon = isConciergeResult ? Bot : Icon;

        return (
          <Marker pitchAlignment="viewport"
            key={bId}
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
            onClick={e => { e.originalEvent.stopPropagation(); setPopupBusiness(bData); onSelectBusiness(bId); }}
          >
            <div
              className={cn(
                "cursor-pointer transition-all duration-300 relative flex flex-col items-center animate-in zoom-in fade-in slide-in-from-bottom-4",
                isSelected ? "scale-125 z-50" : "scale-100 z-10",
                (panelMode === "categories" && (bData as any).isItineraryItem && !(bData as any).isLibraryItem) ? "opacity-50 grayscale hover:opacity-100 hover:grayscale-0" : ""
              )}
              style={{ animationDuration: `${300 + (index % 10) * 50}ms` }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-[2px] rounded-full" />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-[2.5px] border-white transition-all ${isSelected ? "ring-[3px] ring-white/50" : ""}`}
                style={{ backgroundColor: markerBg }}
              >
                <MarkerIcon className="w-4 h-4 text-white" />
              </div>
              <div className="w-1.5 h-1.5 -mt-1 rotate-45 border-r-[2.5px] border-b-[2.5px] border-white" style={{ backgroundColor: markerBg }} />
            </div>
          </Marker>
        );
      })}
    </>
  );
}

interface ExploreMapProps {
  businesses: Business[]
  selectedId: string | null
  onSelectBusiness: (id: string | null) => void
  mapClickMode?: "start" | "end" | null
  onMapAnchorPick?: (lat: number, lng: number) => void
  categoryCounts?: Record<string, number>
  currentLoc?: string
  onBoundsChange?: (bounds: [number, number, number, number] | null) => void
  dict?: any
}

export default function ExploreMap({ businesses, selectedId, onSelectBusiness, mapClickMode, onMapAnchorPick, categoryCounts = {}, currentLoc = "", onBoundsChange, dict }: ExploreMapProps) {
  const mapRef = useRef<MapRef>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [popupBusiness, setPopupBusiness] = useState<Business | (Partial<Business> & { title?: string, priceTier?: string, rating?: number, description?: string, menuUrl?: string }) | null>(null)
  const [mapMode, setMapMode] = useState<"satellite" | "planning">("satellite")
  const currentCatStr = searchParams.get("cat") || ""
  const currentCats = useMemo(() => currentCatStr ? currentCatStr.split(',').filter(Boolean) : [], [currentCatStr])
  const selectedMapCategory = currentCats.length > 0 ? (currentCats.length === 1 ? currentCats[0].toUpperCase() : `${currentCats.length} CATEGORIES`) : "ALL"
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null)
  const [zoom, setZoom] = useState<number>(11)
  const [isMobile, setIsMobile] = useState(true)
  const [isLocationExpanded, setIsLocationExpanded] = useState(false)
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false)

  const t = dict?.exploreMap || {
    placesHere: "places here",
    tapMapStart: "Tap map to set Start",
    tapMapEnd: "Tap map to set End",
    cancel: "Cancel"
  }

  const currentLocStr = searchParams.get("loc") || ""
  const currentLocs = useMemo(() => currentLocStr ? currentLocStr.split(',').filter(Boolean) : [], [currentLocStr])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { activeItinerary, panelMode: strictPanelMode, setPanelMode, setStartAnchorLocation, updateEndAnchorLocation, insertWaypoint, routeData, setMapClickMode, setMapSearchResults } = useTrip()
  const panelMode = strictPanelMode as string;
  const { isChatOpen } = usePreferences()

  // FlyTo when start anchor location changes
  const startLat = activeItinerary?.startAnchor?.lat
  const startLng = activeItinerary?.startAnchor?.lng
  useEffect(() => {
    if (startLat && startLng && mapRef.current) {
      mapRef.current.flyTo({ center: [startLng, startLat], zoom: 13, duration: 900, essential: true })
    }
  }, [startLat, startLng])

  // FlyTo when end anchor location changes
  const endLat = activeItinerary?.endAnchor?.lat
  const endLng = activeItinerary?.endAnchor?.lng
  useEffect(() => {
    if (endLat && endLng && mapRef.current) {
      mapRef.current.flyTo({ center: [endLng, endLat], zoom: 13, duration: 900, essential: true })
    }
  }, [endLat, endLng])

  // Calculate dynamic right offset for map controls
  // If chat is open, shift left by the chat width (450px)
  const controlsRightOffset = (isChatOpen && panelMode !== 'itinerary') ? "466px" : "16px"

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const mapStyle = mapMode === "satellite" 
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : "mapbox://styles/mapbox/light-v11"


  const waypoints = useMemo(() => {
    if (panelMode !== "itinerary") return [];
    
    const pts: [number, number][] = [];
    
    if (panelMode === "itinerary" && activeItinerary) {
      const start = activeItinerary.startAnchor;
      const end = activeItinerary.endAnchor;
      if (start?.lat && start?.lng) pts.push([start.lng, start.lat]);
      for (const waypoint of activeItinerary.waypoints || []) {
        if (waypoint.lat && waypoint.lng) pts.push([waypoint.lng, waypoint.lat]);
      }
      if (end?.lat && end?.lng) pts.push([end.lng, end.lat]);
    }
    return pts;
  }, [activeItinerary, panelMode]);

  const directWaypoints = useMemo(() => {
    if (panelMode !== "itinerary") return [];
    const pts: [number, number][] = [];
    
    if (panelMode === "itinerary" && activeItinerary) {
      const start = activeItinerary.startAnchor;
      const end = activeItinerary.endAnchor;
      if (start?.lat && start?.lng) pts.push([start.lng, start.lat]);
      if (end?.lat && end?.lng) pts.push([end.lng, end.lat]);
    }
    return pts;
  }, [activeItinerary, panelMode]);

  const activeLegIndex = useMemo(() => {
    if (panelMode !== 'itinerary' || !selectedId) return null;
    if (selectedId === 'itin-start') return 0;
    if (selectedId === 'itin-arrival') return activeItinerary?.waypoints?.length ?? 0;
    
    const wpIndex = activeItinerary?.waypoints?.findIndex((w: any) => w.id === selectedId);
    if (wpIndex !== undefined && wpIndex >= 0) {
      return wpIndex; 
    }
    return null;
  }, [selectedId, activeItinerary, panelMode]);

  const itineraryRoute = useMemo(() => {
    if (!routeData?.geometry) return null;
    if (routeData.legGeometries && routeData.legGeometries.length > 0) {
      return {
        type: 'FeatureCollection',
        features: routeData.legGeometries
      } as GeoJSON.FeatureCollection<GeoJSON.LineString>;
    }
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { legIndex: 0 },
        geometry: routeData.geometry
      }]
    } as GeoJSON.FeatureCollection<GeoJSON.LineString>;
  }, [routeData]);

  const directRoute = useMemo(() => {
    if (directWaypoints.length < 2) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: directWaypoints }
    } as GeoJSON.Feature<GeoJSON.LineString>;
  }, [directWaypoints]);

  // Itinerary waypoint markers
  const itineraryMarkers = useMemo(() => {
    if (panelMode === "itinerary" && activeItinerary) {
      return (activeItinerary.waypoints || [])
        .filter((w: any) => w.lat != null && w.lng != null)
        .map((w: any, idx: number) => {
           const pick = {
              id: w.id,
              name: w.title || w.locationStr,
              category: w.service?.category || w.category,
              lat: w.lat,
              lng: w.lng,
              ...(w.service || {})
           };
           return { pick, idx };
        });
    }
    
    return [];
  }, [activeItinerary, panelMode]);

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  // Fly to selected business or itinerary point
  useEffect(() => {
    if (!selectedId) { setPopupBusiness(null); return; }

    const isItineraryId = selectedId === 'itin-start' || selectedId === 'itin-arrival';
    const pitch = isItineraryId ? 0 : (mapMode === "satellite" ? 60 : 0);
    
    let startAnchor: any = null;
    let endAnchor: any = null;
    
    if (panelMode === "itinerary" && activeItinerary) {
      startAnchor = activeItinerary.startAnchor;
      endAnchor = activeItinerary.endAnchor;
    }

    if (selectedId === 'itin-start' && startAnchor?.lat && startAnchor?.lng) {
      const currentZoom = mapRef.current?.getZoom() || 0;
      const targetZoom = Math.max(currentZoom, 15);
      mapRef.current?.flyTo({ center: [startAnchor.lng as number, startAnchor.lat as number], zoom: targetZoom, pitch, duration: 1200, essential: true, offset: [0, isMobile ? 220 : 150] });
      setPopupBusiness(null);
      return;
    }

    if (selectedId === 'itin-arrival' && endAnchor?.lat && endAnchor?.lng) {
      const currentZoom = mapRef.current?.getZoom() || 0;
      const targetZoom = Math.max(currentZoom, 15);
      mapRef.current?.flyTo({ center: [endAnchor.lng as number, endAnchor.lat as number], zoom: targetZoom, pitch, duration: 1200, essential: true, offset: [0, isMobile ? 220 : 150] });
      setPopupBusiness(null);
      return;
    }

    let targetLat: number | null = null;
    let targetLng: number | null = null;
    let targetBusiness: Business | null = null;

    // 1. Direct Business Match
    const b = businesses.find(b => b.id === selectedId);
    if (b && b.lat !== null && b.lng !== null) {
      targetLat = b.lat;
      targetLng = b.lng;
      targetBusiness = b;
    } 

    // Add fallback to URL params if business not in current page
    if (!targetLat && latParam && lngParam && selectedId) {
      targetLat = parseFloat(latParam);
      targetLng = parseFloat(lngParam);
      // We might not have the full business object, but we can fly to it
      targetBusiness = { id: selectedId, name: "Selected Location", lat: targetLat, lng: targetLng } as Business;
    }
    
    // 2. Active Itinerary (Micro-Day) Match
    if (!targetLat && activeItinerary) {
      for (const wp of activeItinerary.waypoints ?? []) {
        if (wp.id === selectedId && wp.lat !== undefined && wp.lng !== undefined) {
          targetLat = wp.lat;
          targetLng = wp.lng;
          targetBusiness = wp.service ? { ...wp.service, lat: wp.lat, lng: wp.lng } : { id: wp.id, name: wp.title || wp.locationStr, lat: wp.lat, lng: wp.lng, category: wp.category };
          break;
        }
        if (wp.alternatives) {
          const alt = wp.alternatives.find((a: any) => a.id === selectedId);
          if (alt && alt.lat !== undefined && alt.lng !== undefined) {
            targetLat = alt.lat;
            targetLng = alt.lng;
            targetBusiness = alt.service ? { ...alt.service, lat: alt.lat, lng: alt.lng } : { id: alt.id, name: alt.title || alt.locationStr, lat: alt.lat, lng: alt.lng, category: alt.category };
            break;
          }
        }
      }
    } 
    
    // 3. Mock Hotel Fallback (Basecamp Carousel)
    if (!targetLat && selectedId?.startsWith('hotel-')) {
      const mockCoords: Record<string, [number, number]> = {
        'hotel-1': [-13.3135, -72.1158],
        'hotel-2': [-13.3100, -72.0800],
        'hotel-3': [-13.3150, -72.1200]
      };
      if (mockCoords[selectedId]) {
        targetLng = mockCoords[selectedId][1];
        targetLat = mockCoords[selectedId][0];
      }
    }

    if (targetLat !== null && targetLng !== null) {
      const currentZoom = mapRef.current?.getZoom() || 0;
      const targetZoom = Math.max(currentZoom, 15);
      mapRef.current?.flyTo({ center: [targetLng, targetLat], zoom: targetZoom, pitch: (mapMode === "satellite" ? 60 : 0), duration: 1200, essential: true, offset: [0, isMobile ? 220 : 150] });
      setPopupBusiness(targetBusiness);
    } else {
      setPopupBusiness(null);
    }
  }, [selectedId, businesses, activeItinerary, mapMode, panelMode]);

  const validBusinesses = useMemo(() => {
    return businesses
      .filter(b => b.lat != null && b.lng != null && !isNaN(b.lat) && !isNaN(b.lng))
      .filter(b => {
        if (currentCats.length === 0) return true;
        const bCat = b.category?.toUpperCase() || "UNKNOWN";
        return currentCats.some(cat => {
            const c = cat.toUpperCase();
            if (c === bCat) return true;
            if (c === "DINING" && bCat === "MEAL") return true;
            if (c === "STAYS" && bCat === "STAY") return true;
            if (c === "AGENCY" && bCat === "EXPERIENCE") return true;
            return false;
        });
      }) as (Business & { lat: number, lng: number })[];
  }, [businesses, currentCats]);

  const pointsByCategory = useMemo(() => {
    const categories: Record<string, any[]> = {};
    validBusinesses.forEach(business => {
      const cat = business.category?.toUpperCase() || 'UNKNOWN';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(business);
    });
    return categories;
  }, [validBusinesses]);

  const businessSignature = validBusinesses.map(b => b.id).join(',');
  const [prevSignature, setPrevSignature] = useState<string | null>(null);

  useEffect(() => {
    if (validBusinesses.length === 0 || !mapRef.current) return;

    // We should refit the bounds if the businesses change
    const shouldRefit = businessSignature !== prevSignature;

    if (shouldRefit) {
      setPrevSignature(businessSignature);

      // Skip fitBounds if we already have a selected item to fly to, to avoid animation conflicts
      if (selectedId && validBusinesses.some(b => b.id === selectedId)) {
        return;
      }

      let minLng = validBusinesses[0].lng;
      let maxLng = validBusinesses[0].lng;
      let minLat = validBusinesses[0].lat;
      let maxLat = validBusinesses[0].lat;

      const boundsItems = validBusinesses.slice(0, 20);
      for (const b of boundsItems) {
        if (b.lng < minLng) minLng = b.lng;
        if (b.lng > maxLng) maxLng = b.lng;
        if (b.lat < minLat) minLat = b.lat;
        if (b.lat > maxLat) maxLat = b.lat;
      }

      if (minLng !== maxLng || minLat !== maxLat) {
        mapRef.current.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: 80, duration: 1200, maxZoom: 15 }
        );
      } else {
        mapRef.current.flyTo({
          center: [minLng, minLat],
          zoom: 14,
          duration: 1200
        });
      }
    }
  }, [validBusinesses, businessSignature, prevSignature, selectedId]);
  const center = validBusinesses.length > 0
    ? [validBusinesses.reduce((s, b) => s + b.lng, 0) / validBusinesses.length, validBusinesses.reduce((s, b) => s + b.lat, 0) / validBusinesses.length]
    : [-71.9675, -13.5226];

  const updateMapBounds = useCallback((evt: any) => {
    setZoom(evt.viewState.zoom);
    const mapBounds = mapRef.current?.getMap().getBounds();
    if (mapBounds) {
      const boundsArr: [number, number, number, number] = [
        mapBounds.getWest(),
        mapBounds.getSouth(),
        mapBounds.getEast(),
        mapBounds.getNorth()
      ];
      setBounds(boundsArr);
      if (onBoundsChange) onBoundsChange(boundsArr);
    }
  }, [onBoundsChange]);

  const navigateLocation = (locValue: string) => {
    if (setMapSearchResults) setMapSearchResults(null);
    const params = new URLSearchParams(searchParams.toString());
    if (locValue) params.set("loc", locValue);
    else params.delete("loc");
    params.delete("lat");
    params.delete("lng");
    params.delete("id");
    router.push(`/explore?${params.toString()}`);
  }

  const availableMapCategories = useMemo(() => {
    const activeUpper = currentCats.map(c => c.toUpperCase());
    const cats = CATEGORIES.filter(cat => 
      cat.value !== "Template" && cat.value !== "Agency" &&
      ((categoryCounts[cat.value.toUpperCase()] || 0) > 0 || activeUpper.includes(cat.value.toUpperCase()))
    ).map(c => c.value.toUpperCase());
    return ["ALL", ...cats];
  }, [categoryCounts, currentCats]);

  const toggleCategory = (catValue: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (setMapSearchResults) setMapSearchResults(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("lng");
    params.delete("id");
    if (catValue === "ALL") {
       params.delete("cat");
    } else {
       const newCats = [...currentCats];
       const normalized = catValue.charAt(0).toUpperCase() + catValue.slice(1).toLowerCase();
       // Check case-insensitively
       const existingIndex = newCats.findIndex(c => c.toLowerCase() === normalized.toLowerCase());
       if (existingIndex >= 0) {
         newCats.splice(existingIndex, 1);
       } else {
         newCats.push(normalized);
       }
       if (newCats.length > 0) {
         params.set("cat", newCats.join(','));
       } else {
         params.delete("cat");
       }
    }
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="relative w-full h-full group">
      {/* Floating Controls (Drive Time - Left) */}
      <div className="absolute bottom-[104px] md:bottom-8 left-4 md:left-6 z-[60] flex flex-col-reverse gap-2 pointer-events-auto items-start">
        {/* Drive Time Badge */}
        {panelMode === 'itinerary' && routeData && routeData.duration != null && (
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3 w-fit mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drive Time</span>
              <span className="text-sm font-bold text-slate-700">
                {Math.floor(routeData.duration / 3600) > 0 ? `${Math.floor(routeData.duration / 3600)}h ` : ''}
                {Math.floor((routeData.duration % 3600) / 60)}m
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Controls (Filters + Toggle - Right/Top-Left) */}
      <div className="absolute bottom-[104px] md:bottom-auto md:top-4 right-4 md:right-auto md:left-4 z-[60] flex flex-col-reverse md:flex-col gap-2 pointer-events-auto items-end md:items-start">
        {/* Unified Filter (Location + Category) */}
        <div className="flex items-center gap-2 pb-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-md bg-slate-900 text-white transition-all active:scale-95 border border-white/20">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <div className="flex items-center">
                <span className="truncate max-w-[80px] md:max-w-[120px]">
                  {currentLoc ? LOCATIONS.find(l => l.value === currentLoc)?.label : "Anywhere"}
                </span>
                <span className="opacity-50 mx-1.5 shrink-0">•</span>
                <span className="truncate max-w-[80px] md:max-w-[120px]">
                  {selectedMapCategory === "ALL" ? "All" : selectedMapCategory.charAt(0) + selectedMapCategory.slice(1).toLowerCase()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[9999] max-h-[60vh] overflow-y-auto">
              <div 
                className="px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLocationExpanded(!isLocationExpanded); }}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
                {isLocationExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
              </div>
              {isLocationExpanded && (
                <>
                  <DropdownMenuItem onClick={() => navigateLocation("")} className="justify-between cursor-pointer">
                    <span>Anywhere</span>
                    {!currentLoc && <Check className="w-4 h-4 text-rose-600" />}
                  </DropdownMenuItem>
                  {LOCATIONS.map(loc => (
                    <DropdownMenuItem key={loc.value} onClick={() => navigateLocation(loc.value)} className="justify-between cursor-pointer">
                      <span>{loc.label}</span>
                      {currentLoc === loc.value && <Check className="w-4 h-4 text-rose-600" />}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              <div className="h-px bg-slate-100 my-1.5 mx-1" />
              
              <div 
                className="px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCategoryExpanded(!isCategoryExpanded); }}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                {isCategoryExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
              </div>
              {isCategoryExpanded && (
                <>
                  <DropdownMenuItem onClick={(e) => toggleCategory("ALL", e as any)} className="justify-between cursor-pointer">
                    <span>All Categories</span>
                    {currentCats.length === 0 && <Check className="w-4 h-4 text-rose-600" />}
                  </DropdownMenuItem>
                  {availableMapCategories.filter(c => c !== "ALL").map(cat => {
                    const count = categoryCounts[cat] || 0;
                    return (
                      <DropdownMenuItem key={cat} onClick={(e) => toggleCategory(cat, e as any)} className="justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span>{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                          {count > 0 && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full font-medium">
                              {count}
                            </span>
                          )}
                        </div>
                        {currentCats.some(c => c.toLowerCase() === cat.toLowerCase()) && <Check className="w-4 h-4 text-rose-600" />}
                      </DropdownMenuItem>
                    );
                  })}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Places/Route Toggle */}
        {activeItinerary && (
          <div className="md:hidden flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200 p-0.5 w-fit mb-1">
            <button
              onClick={(e) => { e.preventDefault(); setPanelMode('discover'); }}
              className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-colors", panelMode !== 'itinerary' ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900")}
            >
              Places
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setPanelMode('itinerary'); }}
              className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-colors", panelMode === 'itinerary' ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900")}
            >
              Route
            </button>
          </div>
        )}
      </div>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: center[0], latitude: center[1], zoom: 11, pitch: 0, bearing: 0 }}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        terrain={mapMode === "satellite" ? { source: "mapbox-dem", exaggeration: 1.5 } : undefined}
        cursor={mapClickMode ? 'crosshair' : undefined}
        onClick={(e) => {
          if (mapClickMode && onMapAnchorPick) {
            onMapAnchorPick(e.lngLat.lat, e.lngLat.lng)
          } else {
            setPopupBusiness(null)
          }
        }}
        onMoveEnd={updateMapBounds}
        onZoomEnd={updateMapBounds}
        onLoad={() => {
          const mapBounds = mapRef.current?.getMap().getBounds();
          if (mapBounds) {
            const boundsArr: [number, number, number, number] = [
              mapBounds.getWest(),
              mapBounds.getSouth(),
              mapBounds.getEast(),
              mapBounds.getNorth()
            ];
            setBounds(boundsArr);
            if (onBoundsChange) onBoundsChange(boundsArr);
          }
        }}
      >
        <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />
        {mapMode === "satellite" && <Layer id="sky" type="sky" paint={{ "sky-type": "atmosphere", "sky-atmosphere-sun": [0.0, 0.0], "sky-atmosphere-sun-intensity": 15 }} />}

        {/* Direct baseline route line (Main Route) */}
        {directRoute && panelMode === "itinerary" && (
          <Source id="direct-route" type="geojson" data={directRoute}>
            <Layer id="direct-route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#8E8E93", "line-width": 2, "line-opacity": 0.5, "line-dasharray": [2, 2] }} />
          </Source>
        )}

        {/* Alternative Detour route line */}
        {itineraryRoute && (
          <Source id="itinerary-route" type="geojson" data={itineraryRoute}>
            <Layer id="route-glow" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ 
                "line-color": "#ffffff", 
                "line-width": 12, 
                "line-opacity": panelMode !== "itinerary" ? 0.2 : (activeLegIndex !== null ? [
                  "case",
                  ["==", ["get", "legIndex"], activeLegIndex],
                  0.4,
                  0.0
                ] : 0.4), 
                "line-blur": 6 
              }} />
            <Layer id="route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{
                "line-color": [
                  "match",
                  ["get", "legIndex"],
                  0, "#007AFF", // Blue
                  1, "#FF9500", // Orange
                  2, "#34C759", // Green
                  3, "#AF52DE", // Purple
                  4, "#FF2D55", // Pink
                  5, "#5AC8FA", // Light Blue
                  "#007AFF" // Default back to Blue
                ],
                "line-width": 5, 
                "line-opacity": panelMode !== "itinerary" ? 0.3 : (activeLegIndex !== null ? [
                  "case",
                  ["==", ["get", "legIndex"], activeLegIndex],
                  0.95,
                  0.6
                ] : 0.95)
              }} />
            <Layer id="route-arrows" type="symbol" layout={{
              "symbol-placement": "line",
              "text-field": "▶",
              "text-size": 32,
              "symbol-spacing": 80,
              "text-keep-upright": false
            }} paint={{
              "text-color": [
                "match",
                ["get", "legIndex"],
                0, "#007AFF",
                1, "#FF9500",
                2, "#34C759",
                3, "#AF52DE",
                4, "#FF2D55",
                5, "#5AC8FA",
                "#007AFF"
              ],
              "text-halo-color": "#ffffff",
              "text-halo-width": 2,
              "text-opacity": panelMode !== "itinerary" ? 0.0 : (activeLegIndex !== null ? [
                "case",
                ["==", ["get", "legIndex"], activeLegIndex],
                1.0,
                0.0
              ] : 0.0)
            }} />
          </Source>
        )}

        {/* Start Marker */}
        {(() => {
          let start;
          if (panelMode === "itinerary" && activeItinerary) {
            start = activeItinerary.startAnchor;
          }
          if (!start?.lat || !start?.lng) return null;
          return (
            <Marker pitchAlignment="viewport"
              longitude={start.lng}
              latitude={start.lat}
              anchor="bottom"
              draggable={mapClickMode === 'start'}
              onDragEnd={(e) => {
                if (panelMode === 'itinerary') {
                  setStartAnchorLocation(e.lngLat.lat, e.lngLat.lng)
                }
                setMapClickMode?.(null)
              }}
            >
              <div
                className={cn("group/start flex flex-col items-center", mapClickMode === 'start' ? "cursor-grab active:cursor-grabbing" : "cursor-pointer")}
                title="Start location"
                onClick={e => {
                  e.stopPropagation()
                  mapRef.current?.flyTo({ center: [start.lng as number, start.lat as number], zoom: 14, pitch: 0, duration: 1200, essential: true, offset: [0, isMobile ? 220 : 150] })
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 blur-[3px] rounded-full" />
                <div className="relative flex flex-col items-center z-10 transition-transform group-hover/start:-translate-y-1">
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-xl border-[2.5px] border-white flex items-center gap-1.5">
                    {(start as any).type === 'AIRPORT' ? <Plane className="w-3.5 h-3.5" /> : <Navigation className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-bold tracking-wide">{(start as any).type === 'AIRPORT' ? 'CUZ' : 'START'}</span>
                  </div>
                  {(start as any).title && (
                    <div className="mt-0.5 bg-white/95 backdrop-blur-sm text-slate-800 text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm max-w-[110px] truncate text-center border border-slate-100">
                      {(start as any).title}
                    </div>
                  )}
                  <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r-[2.5px] border-b-[2.5px] border-white" />
                </div>
              </div>
            </Marker>
          );
        })()}

        {/* Arrival Marker */}
        {(() => {
          let end;
          if (panelMode === "itinerary" && activeItinerary) {
            end = activeItinerary.endAnchor;
          }
          if (!end?.lat || !end?.lng) return null;
          return (
            <Marker pitchAlignment="viewport"
              longitude={end.lng}
              latitude={end.lat}
              anchor="bottom"
              draggable={mapClickMode === 'end' && !(end as any).service}
              onDragEnd={(e) => {
                if (panelMode === 'itinerary') {
                  updateEndAnchorLocation(e.lngLat.lat, e.lngLat.lng, end.title, (end as any).service)
                }
                setMapClickMode?.(null)
              }}
            >
              <div
                className={cn("group/end flex flex-col items-center", (mapClickMode === 'end' && !(end as any).service) ? "cursor-grab active:cursor-grabbing" : "cursor-pointer")}
                title="End location"
                onClick={e => {
                  e.stopPropagation();
                  const currentZoom = mapRef.current?.getZoom() || 0;
                  const targetZoom = Math.max(currentZoom, 14);
                  mapRef.current?.flyTo({ center: [end.lng as number, end.lat as number], zoom: targetZoom, pitch: 0, duration: 1200, essential: true, offset: [0, isMobile ? 220 : 150] });
                  if ((end as any).service) {
                    setPopupBusiness((end as any).service);
                    onSelectBusiness((end as any).service.id);
                  }
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 blur-[3px] rounded-full" />
                <div className="relative flex flex-col items-center z-10 transition-transform group-hover/end:-translate-y-1">
                  <div className="bg-rose-600 text-white px-3 py-1.5 rounded-full shadow-xl border-[2.5px] border-white flex items-center gap-1.5">
                    {(end as any).type === 'HOTEL' ? <Bed className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-bold tracking-wide">{(end as any).type === 'HOTEL' ? 'BED' : 'END'}</span>
                  </div>
                  {(end as any).title && (
                    <div className="mt-0.5 bg-white/95 backdrop-blur-sm text-slate-800 text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm max-w-[110px] truncate text-center border border-slate-100">
                      {(end as any).title}
                    </div>
                  )}
                  <div className="w-2.5 h-2.5 bg-rose-600 rotate-45 -mt-1.5 border-r-[2.5px] border-b-[2.5px] border-white" />
                </div>
              </div>
            </Marker>
          );
        })()}

        {/* Itinerary waypoint markers */}
        {itineraryMarkers.map(({ pick, idx }: { pick: any, idx: number }) => {
          const style = getCategoryStyle(pick.category);
          const isSelected = selectedId === pick.id;
          const Icon = style.icon;

          return (
            <Marker pitchAlignment="viewport" key={`itin-${idx}`} longitude={pick.lng as number} latitude={pick.lat as number} anchor="bottom"
              onClick={e => { e.originalEvent.stopPropagation(); setPopupBusiness(pick); onSelectBusiness(pick.id); }}
            >
              <div
                className="cursor-pointer transition-all duration-300 relative flex flex-col items-center"
                style={{ transform: isSelected ? "scale(1.25)" : "scale(1)", zIndex: isSelected ? 50 : 10 }}
              >
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-2 border-white z-20 shadow-md">
                  {idx + 1}
                </div>

                {/* Apple-style shadow blob */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-[2px] rounded-full" />

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-[2.5px] border-white transition-all ${isSelected ? "ring-[3px] ring-white/50" : ""}`}
                  style={{ backgroundColor: style.bg }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {/* Pointer tip */}
                <div className="w-1.5 h-1.5 -mt-1 rotate-45 border-r-[2.5px] border-b-[2.5px] border-white" style={{ backgroundColor: style.bg }} />
              </div>
            </Marker>
          )
        })}
        {/* Regular business markers — hidden in itinerary mode */}
        {(panelMode !== "itinerary") && Object.entries(pointsByCategory).map(([category, catBusinesses]) => (
          <CategoryClusterLayer
            key={category}
            category={category}
            businesses={catBusinesses}
            bounds={bounds}
            zoom={zoom}
            mapRef={mapRef}
            selectedId={selectedId}
            setPopupBusiness={setPopupBusiness}
            onSelectBusiness={onSelectBusiness}
            panelMode={panelMode}
            isMobile={isMobile}
          />
        ))}

        {popupBusiness && (popupBusiness as any).lng != null && (popupBusiness as any).lat != null && !isNaN((popupBusiness as any).lng) && !isNaN((popupBusiness as any).lat) && (
          <Popup
            anchor="bottom" longitude={(popupBusiness as any).lng as number} latitude={(popupBusiness as any).lat as number}
            onClose={() => { setPopupBusiness(null); onSelectBusiness(null); }} maxWidth="280px"
            closeButton={false} closeOnClick={false} className="z-50" offset={32}
          >
            {(popupBusiness as any).isClusterPopup ? (
              <div className="w-[280px] p-4 bg-white rounded-2xl shadow-xl border border-white/20 relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setPopupBusiness(null); onSelectBusiness(null); }} className="absolute top-4 right-4 z-50 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1 shadow-sm"><X className="w-4 h-4"/></button>
                <h3 className="font-bold text-slate-900 mb-3 border-b pb-2">{(popupBusiness as any).businesses.length} {t.placesHere}</h3>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {(popupBusiness as any).businesses.map((b: any) => (
                    <div key={b.id} onClick={() => { setPopupBusiness(b); onSelectBusiness(b.id); }} className="cursor-pointer hover:bg-slate-50 p-2 rounded-xl border border-slate-100 transition-colors">
                      <p className="font-bold text-sm text-slate-800 leading-tight">{b.name}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{b.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (popupBusiness as any).category === 'NOTE' ? (
              <div className="w-48 p-4 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setPopupBusiness(null); onSelectBusiness(null); }} className="absolute top-2 right-2 text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
                <div className="flex items-center gap-2 mb-2 pr-4 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Waypoint</span>
                </div>
                <p className="text-sm font-medium leading-snug">
                  {(popupBusiness as any).name || (popupBusiness as any).title}
                </p>
              </div>
            ) : (
              <div className="w-[320px] relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setPopupBusiness(null); onSelectBusiness(null); }} className="absolute top-2 right-2 z-50 text-slate-400 hover:text-slate-700 bg-white/80 rounded-full p-1.5 shadow-sm backdrop-blur-sm"><X className="w-4 h-4"/></button>
                <BusinessCard 
                  business={popupBusiness as Business} 
                  orientation="vertical" 
                  showActions={panelMode !== "itinerary"} 
                  showItineraryEnd={panelMode !== "discover"}
                  onSelect={() => {
                    const slug = (popupBusiness as Business).slug;
                    if (slug) router.push(`/business/${slug}`);
                  }}
                  onDoubleClick={() => {
                    const slug = (popupBusiness as Business).slug;
                    if (slug) router.push(`/business/${slug}`);
                  }}
                  showMap={false} 
                />
              </div>
            )}
          </Popup>
        )}

        <GeolocateControl 
          position="top-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          showUserHeading={true}
        />
        <NavigationControl 
          position="top-right"
          showCompass={true} 
          visualizePitch={true} 
        />
        <StyleSwitcherControl mapMode={mapMode} setMapMode={setMapMode} />
      </Map>

      <div className="absolute bottom-1 left-2 z-10 text-[9px] text-slate-400/40 pointer-events-none uppercase tracking-tighter">
        Vallecito OS × Apple Maps Style
      </div>

      {mapClickMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-slate-900/95 text-white text-xs font-bold pl-5 pr-1.5 py-1.5 rounded-full shadow-xl backdrop-blur-sm select-none">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
          <span className="whitespace-nowrap">{mapClickMode === 'start' ? t.tapMapStart : t.tapMapEnd}</span>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapClickMode?.(null); }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors shrink-0 cursor-pointer pointer-events-auto"
            title={t.cancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <style>{`
        .mapboxgl-ctrl-top-right {
          transition: right 0.3s ease-in-out !important;
          right: ${controlsRightOffset} !important;
        }
      `}</style>
    </div>
  );
}
