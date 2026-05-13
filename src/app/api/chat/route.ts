import { streamText, stepCountIs, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { toolsRegistry } from '@/lib/ai/tools/registry';
import { SYSTEM_PROMPT_CONCIERGE, PLANNING_PROMPT, RESEARCH_PROMPT, SUPPORT_PROMPT, CONVERSATION_FLOW_PROMPT } from '@/lib/ai/prompts';
import { PSYCHOGRAPHIC_MATRIX } from '@/lib/trip/psychographic-matrix';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const maxDuration = 60;

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
    const body = await req.json();
    const { messages, userLat, userLng, localTime, targetDate, archetype, intensity, itineraryStartTitle, itineraryEndTitle, itineraryState } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    const hasGPS = userLat != null && userLng != null;
    const gpsStatus = hasGPS ? 'CONFIRMED GPS' : 'TOURIST HAS NOT SHARED LOCATION YET';

    let systemInstruction = SYSTEM_PROMPT_CONCIERGE
      .replace('{localTime}', localTime || 'unknown')
      .replace('{targetDate}', targetDate || 'today')
      .replace('{userLat}', hasGPS ? String(userLat) : 'NOT_SHARED')
      .replace('{userLng}', hasGPS ? String(userLng) : 'NOT_SHARED')
      .replace('{gpsStatus}', gpsStatus);

    systemInstruction += `\n\n${CONVERSATION_FLOW_PROMPT}\n\n${PLANNING_PROMPT}\n\n${SUPPORT_PROMPT}\n\n${RESEARCH_PROMPT}`;

    if (itineraryState) {
      systemInstruction += `\n\n<CURRENT_ITINERARY>\n${itineraryState}\n</CURRENT_ITINERARY>`;
    }

    if (archetype && intensity && PSYCHOGRAPHIC_MATRIX[archetype]?.[intensity]) {
      systemInstruction += `\n\n<PSYCHOGRAPHIC_PROFILE>\nThe user is a [${archetype}] traveler seeking Intensity Level [${intensity}]. YOU MUST STRICTLY ALIGN YOUR RECOMMENDATIONS AND TONE WITH THIS EXACT DEFINITION: "${PSYCHOGRAPHIC_MATRIX[archetype][intensity]}".\nDo not suggest Level 3 intensity items to a Level 1 user, and vice versa. Adjust your conversational personality to match their risk tolerance and desires.\n</PSYCHOGRAPHIC_PROFILE>`;
    }

    // Normalize: initial messages may use legacy `content` string; v6 UIMessage uses `parts`
    const normalizedMessages = messages.map((msg: any) => {
      if (!msg.parts && typeof msg.content === 'string') {
        return { ...msg, parts: [{ type: 'text', text: msg.content }] };
      }
      // Inject system instruction for itinerary-addition acknowledgement
      if (msg.role === 'user' && msg.parts) {
        const textPart = msg.parts.find((p: any) => p.type === 'text');
        if (textPart?.text?.startsWith('I just added') && textPart.text.includes('to my itinerary.')) {
          const hasStart = !!itineraryStartTitle;
          const hasEnd = !!itineraryEndTitle;
          let instruction: string;
          if (hasStart && hasEnd) {
            instruction = `[System Instruction: Acknowledge this addition warmly. The itinerary already has start="${itineraryStartTitle}" and end="${itineraryEndTitle}" set. Do NOT ask again — just say something like "Great addition! Your route goes from ${itineraryStartTitle} to ${itineraryEndTitle}. Want to swap the start or end, or shall we keep going?"]`;
          } else if (hasStart) {
            instruction = `[System Instruction: Acknowledge this addition. Start is already set to "${itineraryStartTitle}". Only ask where they want to end their day — do not ask about the start again.]`;
          } else if (hasEnd) {
            instruction = `[System Instruction: Acknowledge this addition. End is already set to "${itineraryEndTitle}". Only ask where they are starting from — do not ask about the end again.]`;
          } else {
            instruction = `[System Instruction: Acknowledge this addition and ask: "Do you want to set the start where you are? And do you have an idea where you will end this itinerary?"]`;
          }
          return {
            ...msg,
            parts: msg.parts.map((p: any) =>
              p.type === 'text'
                ? { ...p, text: p.text + '\n\n' + instruction }
                : p
            )
          };
        }
      }
      return msg;
    });

    const modelMessages = await convertToModelMessages(normalizedMessages);

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemInstruction,
      messages: modelMessages,
      onError: ({ error }) => {
        console.error("[AI Concierge] streamText error:", error);
      },
      tools: {
        askAvailability: toolsRegistry.askAvailability,
        askUserLocation: toolsRegistry.askUserLocation,
        searchDatabase: toolsRegistry.searchDatabase,
        showBoletoInfo: toolsRegistry.showBoletoInfo,
        estimateTaxiFare: toolsRegistry.estimateTaxiFare,
        triggerSupportAlert: toolsRegistry.triggerSupportAlert,
        queryExpatsGuide: toolsRegistry.queryExpatsGuide,
        buildItinerary: toolsRegistry.buildItinerary,
        mutateItinerary: toolsRegistry.mutateItinerary,
        generateSaveLink: toolsRegistry.generateSaveLink
      },
      stopWhen: stepCountIs(8),
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
