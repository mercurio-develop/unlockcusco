import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { findNearbyBusinesses } from '@/lib/ai/tools/find-nearby';
import { buildItinerary } from '@/lib/ai/tools/build-itinerary';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, userLat, userLng, localTime } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: `You are the Inkaportal Concierge. Current time: ${localTime}. User coords: ${userLat}, ${userLng}. NEVER output outbound WhatsApp links. ALWAYS use tools to render Generative UI components.`,
      messages,
      tools: {
        findNearbyBusinesses,
        buildItinerary,
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
