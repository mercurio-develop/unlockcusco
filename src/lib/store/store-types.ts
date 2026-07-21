export interface InteractionRecord {
  type: "view" | "map_click";
  id: string;
  name?: string;
  timestamp: number;
}

export interface RadarState {
  waypointId: string;
  lat: number;
  lng: number;
  name: string;
  category: string;
}
