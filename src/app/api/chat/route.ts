import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { findLocalExperiences } from '@/lib/ai/tools/local-experiences';
import { buildSpatialItinerary } from '@/lib/ai/tools/itinerary-builder';
import { estimateTaxiFare } from '@/lib/ai/tools/taxi-estimator';
import { buildChronoRelay } from '@/lib/ai/tools/chrono-relay';
import { askAvailability } from '@/lib/ai/tools/ask-availability';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
    });

    const { messages, userLat, userLng, localTime } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: `You are the Inkaportal Concierge. Current time: ${localTime}. User coords: ${userLat}, ${userLng}. NEVER output outbound WhatsApp links. ALWAYS use tools to render Generative UI components. For complex journeys, use buildChronoRelay to offer a complete relay sequence (food + transit + stay). Use findLocalExperiences to recommend specific spots. Use buildSpatialItinerary for multi-stop plans.`,
      messages: await convertToModelMessages(messages),
      tools: {
        findLocalExperiences,
        buildSpatialItinerary,
        estimateTaxiFare,
        buildChronoRelay,
        askAvailability,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
