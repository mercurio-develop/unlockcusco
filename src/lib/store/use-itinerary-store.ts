import { create } from 'zustand';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';
import type { Business } from "@prisma/client";

export type TransportProfile = "driving" | "walking";

export interface ItineraryState {
  activeItinerary: OptimizedPlan | null;
  transportProfiles: Record<number, TransportProfile>;
  
  setActiveItinerary: (itinerary: OptimizedPlan | null | ((prev: OptimizedPlan | null) => OptimizedPlan | null)) => void;
  setStartAnchorLocation: (lat: number, lng: number, title?: string, service?: Business) => void;
  clearStartAnchor: () => void;
  updateEndAnchorLocation: (lat: number, lng: number, title?: string, service?: Business) => void;
  clearEndAnchor: () => void;
  insertWaypoint: (service: Business) => boolean;
  swapWaypoint: (targetId: string, newService: Business) => void;
  removeWaypoint: (id: string) => void;
  moveWaypoint: (id: string, direction: "up" | "down") => void;
  setWaypoints: (waypoints: OptimizedPlan["waypoints"]) => void;
  setLegTransportProfile: (index: number, profile: TransportProfile) => void;
}

export const useItineraryStore = create<ItineraryState>((set) => ({
  activeItinerary: null,
  transportProfiles: {},

  setActiveItinerary: (itinerary) => set((state) => ({
    activeItinerary: typeof itinerary === 'function' ? itinerary(state.activeItinerary) : itinerary
  })),

  setStartAnchorLocation: (lat, lng, title = "Current Location", service) => {
    set((state) => {
      const prev = state.activeItinerary;
      const base = prev ?? {
        title: undefined,
        startAnchor: { title, locationStr: title, type: 'GENERIC_TOWN' as const, lat, lng, time: '09:00', service },
        endAnchor:   { title: 'Destination', locationStr: 'Destination', type: 'GENERIC_TOWN' as const, lat: -13.3047, lng: -72.1167, time: '18:00' },
        waypoints: [], transitEdges: [], needsAccommodationUpsell: false, totalCost: 0,
      };
      return {
        activeItinerary: {
          ...base,
          startAnchor: { ...base.startAnchor, lat, lng, locationStr: title, title, service }
        }
      };
    });
  },

  clearStartAnchor: () => {
    set((state) => {
      const prev = state.activeItinerary;
      if (!prev) return state;
      return {
        activeItinerary: {
          ...prev,
          startAnchor: {
            title: "Current Location",
            locationStr: "Current Location",
            type: 'GENERIC_TOWN' as const,
            lat: undefined,
            lng: undefined,
            time: '09:00',
            service: undefined
          }
        }
      };
    });
  },

  updateEndAnchorLocation: (lat, lng, title = "Custom End Location", service) => {
    set((state) => {
      const prev = state.activeItinerary;
      const base = prev ?? {
        title: undefined,
        startAnchor: { title: 'Current Location', locationStr: 'Current Location', type: 'GENERIC_TOWN' as const, lat: -13.5226, lng: -71.9673, time: '09:00' },
        endAnchor:   { title, locationStr: title, type: 'GENERIC_TOWN' as const, lat, lng, time: '18:00', service },
        waypoints: [], transitEdges: [], needsAccommodationUpsell: false, totalCost: 0,
      };
      return {
        activeItinerary: {
          ...base,
          endAnchor: {
            ...base.endAnchor,
            lat,
            lng,
            locationStr: title,
            title: title,
            ...(service !== undefined ? { service } : {}),
          }
        }
      };
    });
  },

  clearEndAnchor: () => {
    set((state) => {
      const prev = state.activeItinerary;
      if (!prev) return state;
      return {
        activeItinerary: {
          ...prev,
          endAnchor: {
            ...prev.endAnchor,
            title: 'Destination',
            locationStr: 'Destination',
            lat: -13.3047,
            lng: -72.1167,
            service: undefined,
          }
        }
      };
    });
  },

  insertWaypoint: (service) => {
    let result = false;
    set((state) => {
      const prev = state.activeItinerary;
      const newWaypoint = {
        id: service.id,
        category: service.category || 'General',
        title: service.name,
        locationStr: service.name,
        lat: service.lat || undefined,
        lng: service.lng || undefined,
        rating: service.rating || undefined,
        service: service
      };

      if (!prev) {
        const DEFAULT_COORDS = { lat: -13.5226, lng: -71.9673 }; // Cusco
        result = true;
        return {
          activeItinerary: {
            title: undefined,
            startAnchor: {
              title: 'Current Location', locationStr: 'Current Location',
              type: 'GENERIC_TOWN' as const,
              lat: DEFAULT_COORDS.lat, lng: DEFAULT_COORDS.lng, time: '09:00'
            },
            endAnchor: {
              title: 'Destination', locationStr: 'Destination',
              type: 'GENERIC_TOWN' as const,
              lat: undefined, lng: undefined, time: '18:00'
            },
            waypoints: [newWaypoint],
            transitEdges: [],
            needsAccommodationUpsell: false,
            totalCost: 0
          } as OptimizedPlan
        };
      }

      result = true;
      return {
        activeItinerary: {
          ...prev,
          waypoints: [...prev.waypoints, newWaypoint]
        }
      };
    });
    return result;
  },

  swapWaypoint: (targetId, newService) => {
    set((state) => {
      const prev = state.activeItinerary;
      if (!prev) return state;
      
      if (targetId === 'itin-start' && prev.startAnchor) {
        return {
          activeItinerary: {
            ...prev,
            startAnchor: {
              ...prev.startAnchor,
              title: newService.name || 'Current Location',
              locationStr: newService.name || 'Current Location',
              lat: newService.lat || prev.startAnchor.lat,
              lng: newService.lng || prev.startAnchor.lng,
              service: newService
            }
          }
        };
      }
      
      if (targetId === 'itin-arrival' && prev.endAnchor) {
        return {
          activeItinerary: {
            ...prev,
            endAnchor: {
              ...prev.endAnchor,
              title: newService.name || 'Destination',
              locationStr: newService.name || 'Destination',
              lat: newService.lat || prev.endAnchor.lat,
              lng: newService.lng || prev.endAnchor.lng,
              service: newService
            }
          }
        };
      }

      const updatedWaypoints = prev.waypoints.map(w => 
        w.id === targetId ? {
          ...w,
          id: newService.id,
          category: newService.category || 'General',
          title: newService.name,
          locationStr: newService.name,
          lat: newService.lat || undefined,
          lng: newService.lng || undefined,
          rating: newService.rating || undefined,
          service: newService
        } : w
      );
      return { activeItinerary: { ...prev, waypoints: updatedWaypoints } };
    });
  },

  removeWaypoint: (id) => {
    set((state) => {
      const prev = state.activeItinerary;
      if (!prev) return state;
      return { activeItinerary: { ...prev, waypoints: prev.waypoints.filter(w => w.id !== id) } };
    });
  },

  moveWaypoint: (id, direction) => {
    set((state) => {
      const prev = state.activeItinerary;
      if (!prev) return state;
      const index = prev.waypoints.findIndex(w => 
        w.id === id || 
        w.title?.toLowerCase().includes(id.toLowerCase()) || 
        w.locationStr?.toLowerCase().includes(id.toLowerCase())
      );
      if (index < 0) return state;
      
      const newWaypoints = [...prev.waypoints];
      if (direction === "up" && index > 0) {
        [newWaypoints[index - 1], newWaypoints[index]] = [newWaypoints[index], newWaypoints[index - 1]];
      } else if (direction === "down" && index < newWaypoints.length - 1) {
        [newWaypoints[index], newWaypoints[index + 1]] = [newWaypoints[index + 1], newWaypoints[index]];
      } else {
        return state;
      }
      return { activeItinerary: { ...prev, waypoints: newWaypoints } };
    });
  },

  setWaypoints: (waypoints) => {
    set((state) => {
      const prev = state.activeItinerary;
      if (!prev) return state;
      return { activeItinerary: { ...prev, waypoints } };
    });
  },

  setLegTransportProfile: (index, profile) => {
    set((state) => ({
      transportProfiles: { ...state.transportProfiles, [index]: profile }
    }));
  },
}));
