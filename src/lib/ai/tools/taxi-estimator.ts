import { tool } from 'ai';
import { z } from 'zod';
import { calculateDistance } from '@/lib/utils/geo';
import { prisma } from '@/lib/prisma';

export const estimateTaxiFare = tool({
  description: 'Estimates the taxi fare and travel time from the user\'s current location to a destination business in the Sacred Valley. Use this when the user asks for a taxi, transport, or how to get there.',
  parameters: z.object({
    origin: z.string().optional().default("").describe('The user\'s current location (e.g. Urubamba, Cusco, Pisac, Ollantaytambo). If unknown, default to empty string.'),
    destinationId: z.string().optional().describe('The ID of the business the user wants to go to (if known).'),
    destinationName: z.string().optional().default("").describe('The exact name of the destination business or town.'),
  }),
  execute: async ({ origin, destinationId, destinationName }) => {
     let dest;
     const dName = destinationName || "";
     
     if (destinationId) {
       dest = await prisma.business.findUnique({ where: { id: destinationId } });
     } else if (dName) {
       const cleanName = dName.trim().split(" ")[0];
       dest = await prisma.business.findFirst({ where: { name: { contains: cleanName } } });
     }
     
     // Town fallback coordinates
     const coordsMap: Record<string, { lat: number, lng: number }> = {
       "urubamba": { lat: -13.3047, lng: -72.1167 },
       "huaycho": { lat: -13.3100, lng: -72.0900 },
       "cusco": { lat: -13.5226, lng: -71.9673 },
       "pisac": { lat: -13.4225, lng: -71.8488 },
       "ollantaytambo": { lat: -13.2588, lng: -72.2633 },
       "maras": { lat: -13.3323, lng: -72.1554 },
       "chinchero": { lat: -13.3908, lng: -72.0494 }
     };

     // If destination business not found, check if destinationName is just a town
     let dLat = -13.2588; // Default destination Ollantaytambo
     let dLng = -72.2633;
     let finalDestinationName = dest?.name || dName || "Destination";

     if (dest) {
       dLat = dest.lat ?? dLat;
       dLng = dest.lng ?? dLng;
     } else if (dName) {
       const destLower = dName.toLowerCase();
       for (const [key, coords] of Object.entries(coordsMap)) {
         if (destLower.includes(key)) {
           dLat = coords.lat;
           dLng = coords.lng;
           finalDestinationName = key.charAt(0).toUpperCase() + key.slice(1);
           break;
         }
       }
     } else {
       return { error: "Destination not found. Please clarify the name of the place." };
     }
     
     let originMatched = false;
     let oLat = -13.3047; // default to Urubamba
     let oLng = -72.1167;
     const originLower = (origin || "").toLowerCase();
     for (const [key, coords] of Object.entries(coordsMap)) {
       if (originLower.includes(key)) {
         oLat = coords.lat;
         oLng = coords.lng;
         originMatched = true;
         break;
       }
     }
     
     const dist = calculateDistance(oLat, oLng, dLat, dLng);
     const cost = Math.max(5, Math.round(dist * 1.5));
     const timeMins = Math.max(5, Math.round(dist * 1.2));
     
     const recommendedTaxi = await prisma.business.findFirst({
       where: {
         name: { contains: "taxi" },
         whatsapp: { not: null },
       },
       orderBy: { rating: "desc" }
     });
     
     return {
       destinationName: finalDestinationName,
       originGuessed: originMatched ? origin : "Urubamba (Default)",
       originLat: oLat,
       originLng: oLng,
       destLat: dLat,
       destLng: dLng,
       distanceKm: dist.toFixed(1),
       estimatedCostUSD: cost,
       estimatedTimeMinutes: timeMins,
       taxi: recommendedTaxi ? {
         name: recommendedTaxi.name,
         whatsapp: recommendedTaxi.whatsapp,
         rating: recommendedTaxi.rating
       } : undefined
     };
  }
});

