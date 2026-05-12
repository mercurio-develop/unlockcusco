import { tool } from 'ai';
import { microDaySchema } from '../schemas/planner-schema';

export const buildItinerary = tool({
  description: `Generates a full daily itinerary using the Journey Skeleton. Use this to plan a specific day with start/end anchors, waypoints, and transit.
CRITICAL: You MUST include realistic transit edges between every location. Do not invent fake businesses, use places from your searchDatabase results.
You can include 'pax' (number of passengers) to estimate per-person costs. Ensure totalCost is correctly calculated.`,
  parameters: microDaySchema,
  // @ts-ignore
  execute: async (payload: any) => {
    // Return the generated itinerary payload so it can be rendered by the UI
    return payload;
  }
});
