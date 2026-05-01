import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { buildItinerary } from '@/lib/ai/tools/build-itinerary';
import { askAvailability } from '@/lib/ai/tools/ask-availability';
import { searchDatabase } from '@/lib/ai/tools/search-database';
import { buildMacroTrip } from '@/lib/ai/tools/build-macro-trip';
import { showBoletoInfo } from '@/lib/ai/tools/show-boleto-info';
import { estimateTaxiFare } from '@/lib/ai/tools/taxi-estimator';
import { SYSTEM_PROMPT_CONCIERGE } from '@/lib/ai/prompts';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
    });

    const { messages, userLat, userLng, localTime } = await req.json();
    console.log("=== INCOMING CHAT REQUEST ===");
    console.log("Local Time:", localTime, "Coords:", userLat, userLng);
    console.log("Messages Payload:", JSON.stringify(messages, null, 2));

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    // Normalize seeded messages that have content but no parts (e.g. the welcome message)
    const normalizedMessages = messages.map((msg: any) => {
      if (!msg.parts && msg.content) {
        return { ...msg, parts: [{ type: 'text', text: msg.content }] };
      }
      return msg;
    });

    const systemPrompt = SYSTEM_PROMPT_CONCIERGE
      .replace('{localTime}', localTime || 'unknown')
      .replace('{userLat}', userLat || 'unknown')
      .replace('{userLng}', userLng || 'unknown');

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: systemPrompt,
      messages: await convertToModelMessages(normalizedMessages),
      tools: {
        buildItinerary,
        askAvailability,
        searchDatabase,
        buildMacroTrip,
        showBoletoInfo,
        estimateTaxiFare,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
