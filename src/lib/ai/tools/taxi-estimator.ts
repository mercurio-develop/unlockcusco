import { tool } from 'ai';
import { z } from 'zod';
import { calculateDistance } from '@/lib/utils/geo';
import { prisma } from '@/lib/prisma';

export const estimateTaxiFare = tool({
  description: 'Estimates the taxi fare and travel time from the user\'s current location to a destination business in the Sacred Valley. Use this when the user asks for a taxi, transport, or how to get there.',
  inputSchema: z.object({
    origin: z.string().describe('The user\'s current location (e.g. Urubamba, Cusco, Pisac, Ollantaytambo, a specific hotel name). If unknown, ask the user where they are currently located.'),
    destinationId: z.string().optional().describe('The ID of the business the user wants to go to (if known).'),
    destinationName: z.string().optional().describe('The name of the destination if ID is unknown.'),
  }),
  execute: async ({ origin, destinationId, destinationName }) => {
     let dest;
     if (destinationId) dest = await prisma.business.findUnique({ where: { id: destinationId } });
     else if (destinationName) dest = await prisma.business.findFirst({ where: { name: { contains: destinationName } } });
     
     if (!dest) return { error: "Destination not found. Please clarify the name of the place." };
     
     // Mock a distance between towns since we might not have exact coordinates of 'origin' string.
     const originCoords: Record<string, { lat: number, lng: number }> = {
       "urubamba": { lat: -13.3047, lng: -72.1167 },
       "cusco": { lat: -13.5226, lng: -71.9673 },
       "pisac": { lat: -13.2995, lng: -71.8491 },
       "ollantaytambo": { lat: -13.2588, lng: -72.2633 },
       "maras": { lat: -13.3323, lng: -72.1554 },
       "chinchero": { lat: -13.3908, lng: -72.0494 }
     };
     
     let originMatched = false;
     let oLat = -13.3047; // default to Urubamba
     let oLng = -72.1167;
     const originLower = origin.toLowerCase();
     for (const [key, coords] of Object.entries(originCoords)) {
       if (originLower.includes(key)) {
         oLat = coords.lat;
         oLng = coords.lng;
         originMatched = true;
         break;
       }
     }
     
     const dist = calculateDistance(oLat, oLng, dest.lat, dest.lng);
     // 1 km ~ $1.5 USD in the valley roughly for private tourist taxis
     const cost = Math.max(5, Math.round(dist * 1.5));
     const timeMins = Math.max(5, Math.round(dist * 1.2)); // assuming ~50km/h avg speed on mountain roads
     
     return {
       destinationName: dest.name,
       originGuessed: originMatched ? origin : "Urubamba (Default)",
       distanceKm: dist.toFixed(1),
       estimatedCostUSD: cost,
       estimatedTimeMinutes: timeMins,
     };
  }
});
