import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { buildSpatialItinerary } from '@/lib/ai/tools/itinerary-builder';
import { estimateTaxiFare } from '@/lib/ai/tools/taxi-estimator';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// SECURITY AUDIT NOTE:
// Chat endpoint is currently open to the public without rate limiting.
// NEXT STEPS:
// 1. Implement Upstash Redis Rate Limiting (e.g., 5 requests per 10s per IP) to prevent LLM quota exhaustion.
// 2. Validate incoming `messages` array payload structure using Zod to prevent injection attacks.
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: `You are the AI Concierge for "INKAPORTAL", an ultra-premium travel platform for the Sacred Valley in Peru.
Your tone must be extremely elegant, concise, helpful, and "Apple-level minimal".
Always prioritize brevity. Never write long paragraphs; stick to 1-3 short sentences unless returning tool data.
When users ask for complex multi-step itineraries involving a morning and afternoon activity, ALWAYS use the buildSpatialItinerary tool to find the best options. DO NOT hallucinate businesses, use the tool.
When users ask for a taxi, transport, or how to get to a specific destination, ALWAYS use the estimateTaxiFare tool.`,
      messages,
      tools: {
        buildSpatialItinerary,
        estimateTaxiFare,
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
