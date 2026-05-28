import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';
import type { Business } from "@prisma/client";

export type TransportProfile = "driving" | "walking";

export interface ItineraryState {
  activeItinerary: OptimizedPlan | null;
  secondaryItinerary: OptimizedPlan | null;
  activeTab: 'primary' | 'secondary';
  pastItineraries: (OptimizedPlan | null)[];
  futureItineraries: (OptimizedPlan | null)[];
  transportProfiles: Record<number, TransportProfile>;
  
  setActiveTab: (tab: 'primary' | 'secondary') => void;
  setActiveItinerary: (itinerary: OptimizedPlan | null | ((prev: OptimizedPlan | null) => OptimizedPlan | null)) => void;
  undoItinerary: () => void;
  redoItinerary: () => void;
  setStartAnchorLocation: (lat: number, lng: number, title?: string, service?: Business) => void;
  clearStartAnchor: () => void;
  updateEndAnchorLocation: (lat: number, lng: number, title?: string, service?: Business) => void;
  clearEndAnchor: () => void;
  insertWaypoint: (service: Business) => boolean;
  swapWaypoint: (targetId: string, newService: Business) => void;
  removeWaypoint: (id: string) => void;
  moveWaypoint: (id: string, direction: "up" | "down") => void;
  moveToOtherItinerary: (id: string) => void;
  setWaypoints: (waypoints: OptimizedPlan["waypoints"]) => void;
  setLegTransportProfile: (index: number, profile: TransportProfile) => void;
}

const MAX_HISTORY = 10;

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set) => ({
      activeItinerary: null,
      secondaryItinerary: null,
      activeTab: 'primary',
      pastItineraries: [],
      futureItineraries: [],
      transportProfiles: {},

      setActiveTab: (tab) => set({ activeTab: tab }),

      setActiveItinerary: (itinerary) => set((state) => {
        const currentActive = state.activeTab === 'primary' ? state.activeItinerary : state.secondaryItinerary;
        const nextItinerary = typeof itinerary === 'function' ? itinerary(currentActive) : itinerary;
        
        // We only keep history for the primary itinerary for simplicity, or we could complexify it.
        // For now, let's just update the target itinerary.
        if (state.activeTab === 'primary') {
          const newPast = [...state.pastItineraries, state.activeItinerary].slice(-MAX_HISTORY);
          return {
            activeItinerary: nextItinerary,
            pastItineraries: newPast,
            futureItineraries: []
          };
        } else {
          return {
            secondaryItinerary: nextItinerary
          };
        }
      }),

      undoItinerary: () => set((state) => {
        if (state.activeTab !== 'primary' || state.pastItineraries.length === 0) return state;
        const previous = state.pastItineraries[state.pastItineraries.length - 1];
        const newPast = state.pastItineraries.slice(0, -1);
        const newFuture = [state.activeItinerary, ...state.futureItineraries].slice(0, MAX_HISTORY);
        return {
          activeItinerary: previous,
          pastItineraries: newPast,
          futureItineraries: newFuture
        };
      }),

      redoItinerary: () => set((state) => {
        if (state.activeTab !== 'primary' || state.futureItineraries.length === 0) return state;
        const next = state.futureItineraries[0];
        const newFuture = state.futureItineraries.slice(1);
        const newPast = [...state.pastItineraries, state.activeItinerary].slice(-MAX_HISTORY);
        return {
          activeItinerary: next,
          pastItineraries: newPast,
          futureItineraries: newFuture
        };
      }),

      setStartAnchorLocation: (lat, lng, title = "Current Location", service) => {
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
          
          const base = prev ?? {
            title: undefined,
            startAnchor: { title, locationStr: title, type: 'GENERIC_TOWN' as const, lat, lng, time: '09:00', service },
            endAnchor:   { title: 'Destination', locationStr: 'Destination', type: 'GENERIC_TOWN' as const, lat: -13.3047, lng: -72.1167, time: '18:00' },
            waypoints: [], transitEdges: [], needsAccommodationUpsell: false, totalCost: 0,
          };
          
          const updated = {
            ...base,
            startAnchor: { ...base.startAnchor, lat, lng, locationStr: title, title, service }
          };

          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
      },

      clearStartAnchor: () => {
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
          if (!prev) return state;
          
          const updated = {
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
          };

          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
      },

      updateEndAnchorLocation: (lat, lng, title = "Custom End Location", service) => {
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
          
          const base = prev ?? {
            title: undefined,
            startAnchor: { title: 'Current Location', locationStr: 'Current Location', type: 'GENERIC_TOWN' as const, lat: -13.5226, lng: -71.9673, time: '09:00' },
            endAnchor:   { title, locationStr: title, type: 'GENERIC_TOWN' as const, lat, lng, time: '18:00', service },
            waypoints: [], transitEdges: [], needsAccommodationUpsell: false, totalCost: 0,
          };
          
          const updated = {
            ...base,
            endAnchor: {
              ...base.endAnchor,
              lat,
              lng,
              locationStr: title,
              title: title,
              ...(service !== undefined ? { service } : {}),
            }
          };

          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
      },

      clearEndAnchor: () => {
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
          if (!prev) return state;
          
          const updated = {
            ...prev,
            endAnchor: {
              ...prev.endAnchor,
              title: 'Destination',
              locationStr: 'Destination',
              lat: -13.3047,
              lng: -72.1167,
              service: undefined,
            }
          };

          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
      },

      insertWaypoint: (service) => {
        let result = false;
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
          
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
            const updated = {
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
            } as OptimizedPlan;
            
            if (state.activeTab === 'primary') {
              const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
              return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
            } else {
              return { secondaryItinerary: updated };
            }
          }

          result = true;
          const updated = {
            ...prev,
            waypoints: [...prev.waypoints, newWaypoint]
          };
          
          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
        return result;
      },

      swapWaypoint: (targetId, newService) => {
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
          if (!prev) return state;
          
          let updated = prev;
          
          if (targetId === 'itin-start' && prev.startAnchor) {
            updated = {
              ...prev,
              startAnchor: {
                ...prev.startAnchor,
                title: newService.name || 'Current Location',
                locationStr: newService.name || 'Current Location',
                lat: newService.lat || prev.startAnchor.lat,
                lng: newService.lng || prev.startAnchor.lng,
                service: newService
              }
            };
          } else if (targetId === 'itin-arrival' && prev.endAnchor) {
            updated = {
              ...prev,
              endAnchor: {
                ...prev.endAnchor,
                title: newService.name || 'Destination',
                locationStr: newService.name || 'Destination',
                lat: newService.lat || prev.endAnchor.lat,
                lng: newService.lng || prev.endAnchor.lng,
                service: newService
              }
            };
          } else {
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
            updated = { ...prev, waypoints: updatedWaypoints };
          }
          
          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
      },

      removeWaypoint: (id) => {
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
          if (!prev) return state;
          
          const updated = { ...prev, waypoints: prev.waypoints.filter(w => w.id !== id) };
          
          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
      },

      moveWaypoint: (id, direction) => {
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
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
          
          const updated = { ...prev, waypoints: newWaypoints };
          
          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
      },

      moveToOtherItinerary: (id) => {
        set((state) => {
          const sourceKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const targetKey = state.activeTab === 'primary' ? 'secondaryItinerary' : 'activeItinerary';
          
          const sourceItin = state[sourceKey];
          if (!sourceItin) return state;

          const waypointIndex = sourceItin.waypoints.findIndex(w => w.id === id);
          if (waypointIndex === -1) return state;

          const waypointToMove = sourceItin.waypoints[waypointIndex];
          const newSourceWaypoints = [...sourceItin.waypoints];
          newSourceWaypoints.splice(waypointIndex, 1);
          
          const updatedSource = { ...sourceItin, waypoints: newSourceWaypoints };
          
          const targetItin = state[targetKey];
          let updatedTarget: OptimizedPlan;

          if (!targetItin) {
             const DEFAULT_COORDS = { lat: -13.5226, lng: -71.9673 }; // Cusco
             updatedTarget = {
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
                waypoints: [waypointToMove],
                transitEdges: [],
                needsAccommodationUpsell: false,
                totalCost: 0
             } as OptimizedPlan;
          } else {
             updatedTarget = {
                 ...targetItin,
                 waypoints: [...targetItin.waypoints, waypointToMove]
             };
          }

          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, sourceItin as OptimizedPlan | null].slice(-MAX_HISTORY);
            return {
              activeItinerary: updatedSource,
              secondaryItinerary: updatedTarget,
              pastItineraries: newPast,
              futureItineraries: []
            };
          } else {
            return {
              secondaryItinerary: updatedSource,
              activeItinerary: updatedTarget,
            };
          }
        });
      },

      setWaypoints: (waypoints) => {
        set((state) => {
          const targetKey = state.activeTab === 'primary' ? 'activeItinerary' : 'secondaryItinerary';
          const prev = state[targetKey];
          if (!prev) return state;
          
          const updated = { ...prev, waypoints };
          
          if (state.activeTab === 'primary') {
            const newPast = [...state.pastItineraries, prev as OptimizedPlan | null].slice(-MAX_HISTORY);
            return { activeItinerary: updated, pastItineraries: newPast, futureItineraries: [] };
          } else {
            return { secondaryItinerary: updated };
          }
        });
      },

      setLegTransportProfile: (index, profile) => {
        set((state) => ({
          transportProfiles: { ...state.transportProfiles, [index]: profile }
        }));
      },
    }),
    {
      name: 'itinerary-storage',
      partialize: (state) => ({
        activeItinerary: state.activeItinerary,
        secondaryItinerary: state.secondaryItinerary,
        activeTab: state.activeTab,
      }), // only persist these fields
    }
  )
);
