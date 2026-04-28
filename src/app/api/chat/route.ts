import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { buildSpatialItinerary } from '@/lib/ai/tools/itinerary-builder';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-pro'),
    system: `You are the AI Concierge for "INKAPORTAL", an ultra-premium travel platform for the Sacred Valley in Peru.
Your tone must be extremely elegant, concise, helpful, and "Apple-level minimal".
When users ask for complex multi-step itineraries involving a morning and afternoon activity, ALWAYS use the buildSpatialItinerary tool to find the best options. DO NOT hallucinate businesses, use the tool.`,
    messages,
    tools: {
      buildSpatialItinerary,
    },
  });

  return result.toTextStreamResponse();
}

