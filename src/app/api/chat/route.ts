import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages, generateObject } from 'ai';
import { z } from 'zod';
import { buildItinerary } from '@/lib/ai/tools/build-itinerary';
import { askAvailability } from '@/lib/ai/tools/ask-availability';
import { searchDatabase } from '@/lib/ai/tools/search-database';
import { buildMacroTrip } from '@/lib/ai/tools/build-macro-trip';
import { showBoletoInfo } from '@/lib/ai/tools/show-boleto-info';
import { estimateTaxiFare } from '@/lib/ai/tools/taxi-estimator';
import { mutateItinerary } from '@/lib/ai/tools/mutate-itinerary';
import { searchDayTours } from '@/lib/ai/tools/search-day-tours';
import { triggerSupportAlert } from '@/lib/ai/tools/trigger-support';
import { askUserLocation } from '@/lib/ai/tools/ask-user-location';
import { SYSTEM_PROMPT_CONCIERGE, PLANNING_PROMPT, RESEARCH_PROMPT, SUPPORT_PROMPT } from '@/lib/ai/prompts';
import { EXPATS_KNOWLEDGE_BASE } from '@/lib/ai/knowledge/expats-guide';
import { PSYCHOGRAPHIC_MATRIX } from '@/lib/trip/psychographic-matrix';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

export const maxDuration = 30;

// Create a new ratelimiter, that allows 10 requests per 1 hour
const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1h"),
      analytics: true,
      prefix: "@upstash/ratelimit/vallecito-chat",
    })
  : null;

export async function POST(req: Request) {
  try {
    // Rate Limiting Logic
    if (ratelimit) {
      const headerPayload = await headers();
      const ip = headerPayload.get("x-forwarded-for") || "anonymous";
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return new Response(JSON.stringify({ 
            error: "Too many requests. Please try again later.",
            limit,
            remaining,
            reset
        }), { 
            status: 429,
            headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
            }
        });
      }
    }

    // Helicone External Observability Integration
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
      baseURL: process.env.HELICONE_API_KEY ? 'https://gateway.helicone.ai/v1beta' : undefined,
      headers: process.env.HELICONE_API_KEY ? {
        'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
        'Helicone-Property-Session': 'concierge-chat'
      } : undefined
    });

    const { messages, userLat, userLng, localTime, archetype, intensity } = await req.json();
    console.log("=== INCOMING CHAT REQUEST ===");
    console.log("Local Time:", localTime, "Coords:", userLat, userLng, "Profile:", archetype, intensity);
    console.log("Messages Payload:", JSON.stringify(messages, null, 2));

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    // Normalize seeded messages that have content but no parts (e.g. the welcome message)
    const normalizedMessages = messages.map((msg: any) => {
      let content = msg.content;

      // Hidden instruction for the specific itinerary addition message
      if (msg.role === 'user' && content && content.startsWith('I just added') && content.includes('to my itinerary.')) {
        content += '\n\n[System Instruction: Acknowledge this addition and specifically ask the user: "I saw you added an experience to your Day itinerary. Do you want to set the start where you are? And do you have an idea where you will end this itinerary?"]';
      }

      if (!msg.parts && content) {
        return { ...msg, content, parts: [{ type: 'text', text: content }] };
      }
      
      // If parts exist but we modified the content, update the parts too
      if (msg.parts && content !== msg.content) {
          const newParts = [...msg.parts];
          if (newParts.length > 0 && newParts[newParts.length - 1].type === 'text') {
              newParts[newParts.length - 1].text = content;
          } else {
              newParts.push({ type: 'text', text: content });
          }
          return { ...msg, content, parts: newParts };
      }

      return msg;
    });

    let systemPrompt = SYSTEM_PROMPT_CONCIERGE
      .replace('{localTime}', localTime || 'unknown')
      .replace('{userLat}', userLat || 'unknown')
      .replace('{userLng}', userLng || 'unknown');

    systemPrompt += `\n\n<EXPATS_KNOWLEDGE_BASE>\n${EXPATS_KNOWLEDGE_BASE}\n</EXPATS_KNOWLEDGE_BASE>\n`;

    if (archetype && intensity && PSYCHOGRAPHIC_MATRIX[archetype]?.[intensity]) {
      systemPrompt += `\n\n<PSYCHOGRAPHIC_PROFILE>\nThe user is a [${archetype}] traveler seeking Intensity Level [${intensity}]. YOU MUST STRICTLY ALIGN YOUR RECOMMENDATIONS AND TONE WITH THIS EXACT DEFINITION: "${PSYCHOGRAPHIC_MATRIX[archetype][intensity]}".\nDo not suggest Level 3 intensity items to a Level 1 user, and vice versa. Adjust your conversational personality to match their risk tolerance and desires.\n</PSYCHOGRAPHIC_PROFILE>`;
    }

    // --- Intent Router ---
    const lastMessage = messages[messages.length - 1]?.content || "";
    let intent: 'PLANNING' | 'RESEARCH' | 'SUPPORT' = 'RESEARCH'; // default

    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'), // Fast model for routing
        schema: z.object({
          intent: z.enum(['PLANNING', 'RESEARCH', 'SUPPORT']),
        }),
        prompt: `Classify the intent of the following user message from a travel app in the Sacred Valley:
        PLANNING: Asking to build, create, or modify an itinerary or a day plan.
        RESEARCH: Asking general questions about places, food, opening hours, tickets, or alternatives.
        SUPPORT: Expressing frustration, being lost, missing a transport, or needing urgent human help.
        
        Message: "${lastMessage}"`
      });
      intent = object.intent;
    } catch (e) {
      console.warn("Intent router failed, falling back to RESEARCH", e);
    }

    console.log(`🧭 [INTENT ROUTER] Classified as: ${intent}`);

    // --- Dynamic Prompt & Tools ---
    let finalSystemPrompt = systemPrompt;
    let activeTools: any = {};

    switch (intent) {
      case 'PLANNING':
        finalSystemPrompt += `\n\n${PLANNING_PROMPT}`;
        activeTools = { buildItinerary, mutateItinerary, estimateTaxiFare, searchDayTours, askUserLocation };
        break;
      case 'SUPPORT':
        finalSystemPrompt += `\n\n${SUPPORT_PROMPT}`;
        activeTools = { triggerSupportAlert, estimateTaxiFare, askUserLocation };
        break;
      case 'RESEARCH':
      default:
        finalSystemPrompt += `\n\n${RESEARCH_PROMPT}`;
        activeTools = { searchDatabase, showBoletoInfo, askAvailability, estimateTaxiFare, searchDayTours, askUserLocation };
        break;
    }

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: finalSystemPrompt,
      messages: await convertToModelMessages(normalizedMessages),
      tools: activeTools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
