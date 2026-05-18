export const DEFAULT_COORDS = {
  lat: -13.5226, // Defaulting to Cusco
  lng: -71.9673,
};

export const AI_CONCIERGE_INITIAL_MESSAGE = "Welcome to UnlockCusco. ✨\n\nI am your AI Journey Designer. Are you looking to plan a single day, or an extended expedition spanning multiple days? If multiple days, please share your expected arrival and departure dates.";

export const SACRED_VALLEY_LOCATIONS = [
  "Cusco", "Poroy", "Anta", "Huarocondo", "Zurite", "Chinchero", "Maras", "Moray", 
  "Urubamba", "Yucay", "Huayllabamba", "Calca", "Lamay", "Coya", "Taray", "Pisac", 
  "San Salvador", "Huambutio", "Pachar", "Ollantaytambo", "Santa Teresa", "Hidroelectrica", 
  "Aguas Calientes", "Machu Picchu"
];

export const COORDS_MAP: Record<string, { lat: number; lng: number }> = {
  cusco:           { lat: -13.5226, lng: -71.9673 },
  airport:         { lat: -13.5353, lng: -71.9388 },
  aeropuerto:      { lat: -13.5353, lng: -71.9388 },
  poroy:           { lat: -13.4900, lng: -72.0400 },
  anta:            { lat: -13.4706, lng: -72.1481 },
  zurite:          { lat: -13.4561, lng: -72.2575 },
  huarocondo:      { lat: -13.4144, lng: -72.2089 },
  chinchero:       { lat: -13.3908, lng: -72.0494 },
  maras:           { lat: -13.3323, lng: -72.1554 },
  moray:           { lat: -13.3298, lng: -72.1973 },
  urubamba:        { lat: -13.3047, lng: -72.1167 },
  yucay:           { lat: -13.3183, lng: -72.0833 },
  huaycho:         { lat: -13.3100, lng: -72.0900 },
  huayllabamba:    { lat: -13.3333, lng: -72.0667 },
  calca:           { lat: -13.3333, lng: -71.9667 },
  lamay:           { lat: -13.3486, lng: -71.9214 },
  coya:            { lat: -13.3853, lng: -71.8986 },
  taray:           { lat: -13.4300, lng: -71.8600 },
  pisac:           { lat: -13.4225, lng: -71.8488 },
  "san-salvador":  { lat: -13.4833, lng: -71.7833 },
  "san salvador":  { lat: -13.4833, lng: -71.7833 },
  huambutio:       { lat: -13.5500, lng: -71.7333 },
  pachar:          { lat: -13.2681, lng: -72.2356 },
  ollantaytambo:   { lat: -13.2588, lng: -72.2633 },
  "santa-teresa":  { lat: -13.1286, lng: -72.5956 },
  "santa teresa":  { lat: -13.1286, lng: -72.5956 },
  hidroelectrica:  { lat: -13.1539, lng: -72.5647 },
  "aguas-calientes":{ lat: -13.1547, lng: -72.5252 },
  "aguas calientes":{ lat: -13.1547, lng: -72.5252 },
  "machu-picchu":  { lat: -13.1547, lng: -72.5252 },
  "machu picchu":  { lat: -13.1547, lng: -72.5252 },
};
