/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import { calculateDistance } from '@/lib/utils/geo';
import { prisma } from '@/lib/prisma';
import { COORDS_MAP } from '@/lib/constants';

const payloadSchema = z.object({
  origin: z.string().optional().default("").describe('The user\'s current location (e.g. Urubamba, Cusco, Pisac, Ollantaytambo). If unknown, default to empty string.'),
  originLat: z.number().optional().describe('Origin latitude'),
  originLng: z.number().optional().describe('Origin longitude'),
  destinationId: z.string().optional().describe('The ID of the business the user wants to go to (if known).'),
  destinationName: z.string().optional().default("").describe('The exact name of the destination business, OR the name of the town (e.g. Calca, Urubamba).'),
  destLat: z.number().optional().describe('Destination latitude'),
  destLng: z.number().optional().describe('Destination longitude'),
});

type Payload = z.infer<typeof payloadSchema>;

export const estimateTaxiFare = tool({
  description: 'Estimates the taxi fare and travel time from the user\'s current location to a destination business OR a general town in the Sacred Valley. Use this when the user asks for a taxi, transport, or how to get there.',
  parameters: payloadSchema,
  execute: async ({ origin, originLat, originLng, destinationId, destinationName, destLat, destLng }: Payload) => {
     let dest;
     let dName = destinationName || "";
     let finalDestinationName = dName || "Destination";
     let dLat: number | null = destLat ?? null;
     let dLng: number | null = destLng ?? null;

     // Skip DB lookup if coordinates are explicitly provided
     if (dLat === null || dLng === null) {
       // If destinationId was passed by mistake (e.g. AI passed name as ID), fallback to treating it as name
       if (destinationId && !dName) {
         dName = destinationId;
       }

       // Check if dName matches a known town first — avoids a DB business with the same
       // word in its name but wrong/null coordinates overriding the town coords.
       const dNameLower = dName.toLowerCase();
       // Sort longest key first so "ollantaytambo" matches before "anta" etc.
       const townMatch = Object.entries(COORDS_MAP)
         .sort((a, b) => b[0].length - a[0].length)
         .find(([k]) => dNameLower.includes(k.replace(/-/g, ' ')) || dNameLower.includes(k));

       if (destinationId) {
         dest = await prisma.business.findUnique({ where: { id: destinationId } }).catch(() => null);
       }
       
       if (!dest && dName && !townMatch) {
         // Only do DB lookup when it's clearly a business name, not a town
         const cleanName = dName.trim();
         const found = await prisma.business.findFirst({ where: { name: { contains: cleanName, mode: 'insensitive' } } }).catch(() => null);
         // Only use DB result if it has valid coordinates
         if (found?.lat && found?.lng) dest = found;
       }

       finalDestinationName = dest?.name || dName || "Destination";

       if (dest?.lat && dest?.lng) {
         dLat = dest.lat;
         dLng = dest.lng;
       } else if (townMatch) {
         const [, coords] = townMatch;
         dLat = coords.lat;
         dLng = coords.lng;
         finalDestinationName = townMatch[0].charAt(0).toUpperCase() + townMatch[0].slice(1);
       }
     }
     
     if (dLat === null || dLng === null) {
       return { error: `I couldn't find the destination "${dName || destinationId}". Please clarify the exact name of the place or town.` };
     }
     
     let originMatched = false;
     let oLat: number | null = originLat ?? null;
     let oLng: number | null = originLng ?? null;
     let finalOriginName = origin || "Unknown";
     
     if (oLat !== null && oLng !== null) {
       originMatched = true;
     } else {
       const originLower = (origin || "").toLowerCase();
       
       // Fuzzy match for origin: check if any key in COORDS_MAP is contained in the string
       for (const [key, coords] of Object.entries(COORDS_MAP)) {
         // We normalize the key to check for both "san-salvador" and "san salvador" styles
         const cleanKey = key.replace(/-/g, ' ');
         if (originLower.includes(key) || originLower.includes(cleanKey)) {
           oLat = coords.lat;
           oLng = coords.lng;
           finalOriginName = key.charAt(0).toUpperCase() + key.slice(1);
           originMatched = true;
           break;
         }
       }
       
       if (!originMatched && originLower) {
         // Only do DB lookup when it's clearly a business name, not a town
         const cleanOrigin = originLower.trim();
         const foundO = await prisma.business.findFirst({ where: { name: { contains: cleanOrigin, mode: 'insensitive' } } }).catch(() => null);
         if (foundO?.lat && foundO?.lng) {
           oLat = foundO.lat;
           oLng = foundO.lng;
           finalOriginName = foundO.name;
           originMatched = true;
         }
       }
     }
     
     if (!originMatched || oLat === null || oLng === null) {
       return { error: `I couldn't find the pickup location "${origin}". Please clarify the exact name of the place or town.` };
     }
     
     // Fallback: if user provided no origin or we couldn't match, we assume current hub
     // but we mark it clearly so the UI can explain it.
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
       originGuessed: finalOriginName,
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
       } : null
     };
  }
     
} as any);
