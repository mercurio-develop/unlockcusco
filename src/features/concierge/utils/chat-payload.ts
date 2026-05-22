import { DEFAULT_ANCHOR_TITLES } from '../constants';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';

export const formatItineraryState = (activeItinerary: OptimizedPlan | null) => {
  if (!activeItinerary) return null;
  
  return JSON.stringify({
    startAnchor: activeItinerary.startAnchor 
      ? { 
          title: activeItinerary.startAnchor.title, 
          time: activeItinerary.startAnchor.time, 
          lat: activeItinerary.startAnchor.lat, 
          lng: activeItinerary.startAnchor.lng 
        } 
      : null,
    endAnchor: activeItinerary.endAnchor 
      ? { 
          title: activeItinerary.endAnchor.title, 
          time: activeItinerary.endAnchor.time, 
          lat: activeItinerary.endAnchor.lat, 
          lng: activeItinerary.endAnchor.lng 
        } 
      : null,
    waypoints: activeItinerary.waypoints?.map((w) => ({ 
      id: w.id, 
      title: w.title, 
      startTime: w.startTime, 
      lat: w.lat, 
      lng: w.lng 
    })) || []
  });
};

export const buildChatPayload = (params: {
  userCoords: { lat: number; lng: number } | null;
  travelVibe: string | null;
  travelIntensity: number | null;
  targetDate: Date | null;
  activeItinerary: OptimizedPlan | null;
  activeFilters?: { location: string | null; category: string | null };
  currentlyViewing?: string | null;
  interactionHistory?: { type: string, id: string, name?: string, timestamp: number }[];
}) => {
  const { userCoords, travelVibe, travelIntensity, targetDate, activeItinerary, activeFilters, currentlyViewing, interactionHistory } = params;
  
  const sTitle = activeItinerary?.startAnchor?.title;
  const eTitle = activeItinerary?.endAnchor?.title;

  return {
    userLat: userCoords?.lat,
    userLng: userCoords?.lng,
    localTime: new Date().toLocaleTimeString(),
    targetDate: targetDate?.toLocaleDateString() || 'today',
    archetype: travelVibe,
    intensity: travelIntensity,
    activeFilters,
    currentlyViewing,
    interactionHistory,
    itineraryStartTitle: sTitle && !DEFAULT_ANCHOR_TITLES.includes(sTitle) ? sTitle : null,
    itineraryEndTitle: eTitle && !DEFAULT_ANCHOR_TITLES.includes(eTitle) ? eTitle : null,
    itineraryState: formatItineraryState(activeItinerary)
  };
};
