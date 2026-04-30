import { z } from 'zod';

export const optimizedPlanSchema = z.object({
  origin: z.object({
    title: z.string(),
    locationStr: z.string(),
    time: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  destination: z.object({
    title: z.string(),
    locationStr: z.string(),
    time: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  needsAccommodationUpsell: z.boolean(),
  waypoints: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      title: z.string(),
      locationStr: z.string(),
      durationMins: z.number().optional(),
      priceUsd: z.number().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      rating: z.number().optional(),
      alternatives: z.array(z.any()).optional()
    })
  ),
  transitEdges: z.array(
    z.object({
      fromLocation: z.string(),
      toLocation: z.string(),
      defaultDriver: z.object({
        id: z.string().optional(),
        name: z.string(),
        vehicle: z.string().optional(),
        priceUsd: z.number().optional(),
        whatsapp: z.string().optional(),
      }),
      alternativeDrivers: z.array(
        z.object({
          id: z.string().optional(),
          name: z.string(),
          vehicle: z.string().optional(),
          priceUsd: z.number().optional(),
          whatsapp: z.string().optional(),
        })
      ).optional(),
    })
  ),
});

export type OptimizedPlan = z.infer<typeof optimizedPlanSchema>;