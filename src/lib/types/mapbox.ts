export interface MapboxRouteResponse {
  routes: MapboxRoute[];
  waypoints: MapboxWaypoint[];
  code: string;
  uuid: string;
}

export interface MapboxRoute {
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: MapboxLeg[];
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface MapboxLeg {
  via_waypoints: unknown[];
  admins: { iso_3166_1_alpha3: string; iso_3166_1: string }[];
  weight: number;
  duration: number;
  steps: MapboxStep[];
  distance: number;
  summary: string;
}

export interface MapboxStep {
  intersections: unknown[];
  maneuver: {
    type: string;
    instruction: string;
    bearing_after: number;
    bearing_before: number;
    location: [number, number];
    modifier?: string;
  };
  name: string;
  duration: number;
  distance: number;
  driving_side: string;
  weight: number;
  mode: string;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface MapboxWaypoint {
  distance: number;
  name: string;
  location: [number, number];
}
