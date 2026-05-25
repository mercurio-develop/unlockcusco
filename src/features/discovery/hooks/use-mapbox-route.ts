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

// Haversine formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export function useMapboxRoute() {
  const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const transportProfiles = useItineraryStore(s => s.transportProfiles);

  const [routeData, setRouteData] = useState<RouteData | null>(null);

  // Global cache for Mapbox routing requests to avoid over-fetching
  const mapboxCacheRef = useRef<Map<string, MapboxRoute>>(new Map());

  useEffect(() => {
    let isCancelled = false;

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

    // Determine default profile based on bounding box
    let minLat = pts[0][1], maxLat = pts[0][1];
    let minLng = pts[0][0], maxLng = pts[0][0];
    for (const p of pts) {
      if (p[1] < minLat) minLat = p[1];
      if (p[1] > maxLat) maxLat = p[1];
      if (p[0] < minLng) minLng = p[0];
      if (p[0] > maxLng) maxLng = p[0];
    }
    const maxDist = getDistanceKm(minLat, minLng, maxLat, maxLng);
    const defaultProfile = maxDist < 4 ? "walking" : "driving";

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    const fetchLeg = async (p1: [number, number], p2: [number, number], profile: TransportProfile): Promise<MapboxRoute | null> => {
      const cacheKey = `${profile}_${p1[0]},${p1[1]}_${p2[0]},${p2[1]}`;
      if (mapboxCacheRef.current.has(cacheKey)) {
        return mapboxCacheRef.current.get(cacheKey) || null;
      }

      // Fallback to walking for very short segments even if driving is selected, mapbox sometimes fails or loops wildly
      let effectiveProfile = profile;
      if (profile === 'driving' && getDistanceKm(p1[1], p1[0], p2[1], p2[0]) < 0.3) {
        effectiveProfile = 'walking';
      }

      const url = `https://api.mapbox.com/directions/v5/mapbox/${effectiveProfile}/${p1[0]},${p1[1]};${p2[0]},${p2[1]}?geometries=geojson&overview=full&steps=true&access_token=${token}`;
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
      const profile = transportProfiles[i] || defaultProfile;
      legPromises.push(fetchLeg(pts[i], pts[i + 1], profile as TransportProfile));
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

        if (allLegs.length > 0 && !isCancelled) {
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

    return () => {
      isCancelled = true;
    };
  }, [activeItinerary, transportProfiles]);

  return { routeData };
}