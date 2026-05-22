import { useState, useEffect, useRef } from 'react';
import { useItineraryStore } from '@/lib/store/use-itinerary-store';
import type { TransportProfile } from '@/lib/store/use-itinerary-store';
import type { MapboxRoute, MapboxLeg } from '@/lib/types/mapbox';

export interface LegGeometry {
  type: 'Feature';
  properties: {
    legIndex: number;
    profile: string;
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface RouteData {
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  legs: MapboxLeg[];
  legGeometries?: LegGeometry[];
  profile: TransportProfile;
  duration?: number;
}

export function useMapboxRoute() {
  const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const transportProfiles = useItineraryStore(s => s.transportProfiles);

  const [routeData, setRouteData] = useState<RouteData | null>(null);

  // Global cache for Mapbox routing requests to avoid over-fetching
  const mapboxCacheRef = useRef<Map<string, MapboxRoute>>(new Map());

  useEffect(() => {
    if (!activeItinerary) {
      setRouteData(null);
      return;
    }

    const pts: [number, number][] = [];
    const start = activeItinerary.startAnchor;
    if (start?.lat != null && start?.lng != null) pts.push([start.lng, start.lat]);

    for (const waypoint of activeItinerary.waypoints || []) {
      if (waypoint.lat != null && waypoint.lng != null) pts.push([waypoint.lng, waypoint.lat]);
    }

    const end = activeItinerary.endAnchor;
    if (end?.lat != null && end?.lng != null) pts.push([end.lng, end.lat]);

    if (pts.length < 2) {
      setRouteData(null);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    const fetchLeg = async (p1: [number, number], p2: [number, number], profile: TransportProfile): Promise<MapboxRoute | null> => {
      const cacheKey = `${profile}_${p1[0]},${p1[1]}_${p2[0]},${p2[1]}`;
      if (mapboxCacheRef.current.has(cacheKey)) {
        return mapboxCacheRef.current.get(cacheKey) || null;
      }

      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${p1[0]},${p1[1]};${p2[0]},${p2[1]}?geometries=geojson&overview=full&steps=true&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        mapboxCacheRef.current.set(cacheKey, data.routes[0]);
        return data.routes[0];
      }
      return null;
    };

    const legPromises: Promise<MapboxRoute | null>[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const profile = transportProfiles[i] || "driving";
      legPromises.push(fetchLeg(pts[i], pts[i + 1], profile));
    }

    Promise.all(legPromises)
      .then(routeResults => {
        let totalDuration = 0;
        const allLegs: MapboxLeg[] = [];
        const legGeometries: LegGeometry[] = [];
        const combinedCoordinates: [number, number][] = [];

        routeResults.forEach((route, index) => {
          if (!route) return;
          totalDuration += route.duration || 0;

          if (route.legs && route.legs.length > 0) {
            allLegs.push(route.legs[0]);
          }

          const legCoords: [number, number][] = [];
          if (route.legs && route.legs[0].steps) {
            route.legs[0].steps.forEach((step) => {
              if (step.geometry && step.geometry.coordinates) {
                legCoords.push(...step.geometry.coordinates);
                combinedCoordinates.push(...step.geometry.coordinates);
              }
            });
          }

          legGeometries.push({
            type: 'Feature',
            properties: { legIndex: index, profile: transportProfiles[index] || "driving" },
            geometry: {
              type: 'LineString',
              coordinates: legCoords
            }
          });
        });

        if (allLegs.length > 0) {
          setRouteData({
            geometry: {
              type: 'LineString',
              coordinates: combinedCoordinates
            },
            legs: allLegs,
            legGeometries,
            profile: "driving", // Not strictly used for single legs anymore
            duration: totalDuration
          });
        }
      })
      .catch(err => console.error("Mapbox routing error:", err));
  }, [activeItinerary, transportProfiles]);

  return { routeData };
}