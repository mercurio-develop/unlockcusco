/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText, stepCountIs, convertToModelMessages, wrapLanguageModel } from 'ai';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { toolsRegistry } from '@/lib/ai/tools/registry';
import { SYSTEM_PROMPT_CONCIERGE, PLANNING_PROMPT, RESEARCH_PROMPT, SUPPORT_PROMPT, CONVERSATION_FLOW_PROMPT } from '@/lib/ai/prompts';
import { PSYCHOGRAPHIC_MATRIX } from '@/lib/trip/psychographic-matrix';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getBaseModel() {
  const base = google('gemini-2.5-flash');
  if (process.env.NODE_ENV === "development") {
    return wrapLanguageModel({
      model: base,
      middleware: devToolsMiddleware(),
    });
  }
  return base;
}

 
export type ChatMessagePart = { type: 'text'; text: string } | any;
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'data' | 'tool';
  content?: string;
  parts?: ChatMessagePart[];
   
  [key: string]: any;
}

export interface ChatRequestData {
  userLat?: number | null;
  userLng?: number | null;
  localTime?: string;
  targetDate?: string;
  archetype?: keyof typeof PSYCHOGRAPHIC_MATRIX;
  intensity?: "1" | "2" | "3";
  itineraryStartTitle?: string;
  itineraryEndTitle?: string;
  itineraryState?: string;
  currentlyViewing?: string;
  interactionHistory?: { type: string, id: string, name?: string, timestamp: number }[];
  activeFilters?: {
    location?: string;
    category?: string;
  };
}

export async function processChatStream(messages: ChatMessage[], bodyData: ChatRequestData) {
  const { userLat, userLng, localTime, targetDate, archetype, intensity, itineraryStartTitle, itineraryEndTitle, itineraryState, currentlyViewing, interactionHistory, activeFilters } = bodyData;

  const hasGPS = userLat != null && userLng != null;
  const gpsStatus = hasGPS ? 'CONFIRMED GPS' : 'TOURIST HAS NOT SHARED LOCATION YET';

  let systemInstruction = SYSTEM_PROMPT_CONCIERGE
    .replace('{localTime}', localTime || 'unknown')
    .replace('{targetDate}', targetDate || 'today')
    .replace('{userLat}', hasGPS ? String(userLat) : 'NOT_SHARED')
    .replace('{userLng}', hasGPS ? String(userLng) : 'NOT_SHARED')
    .replace('{gpsStatus}', gpsStatus);

  if (currentlyViewing) {
    systemInstruction += `\n\n<CURRENTLY_VIEWING>\nThe user is currently looking at or has selected this business in the UI: "${currentlyViewing}". If they use pronouns like "this place" or "it", they are referring to this business.\n</CURRENTLY_VIEWING>`;
  }

  if (interactionHistory && interactionHistory.length > 0) {
    const historyStr = interactionHistory.map(h => `- ${h.name || h.id} (${h.type})`).join('\n');
    systemInstruction += `\n\n<RECENTLY_VIEWED>\nThe user recently interacted with these businesses in the UI (newest first):\n${historyStr}\nIf they mention "those places" or ask for a comparison, reference this list.\n</RECENTLY_VIEWED>`;
  }

  if (activeFilters?.location || activeFilters?.category) {
    systemInstruction += `\n\n<ACTIVE_FILTERS>\nThe user is currently filtering the map by Location: ${activeFilters.location || 'Any'}, Category: ${activeFilters.category || 'Any'}.\nTake this into account if they ask to search or "show me in the map". You can use multiple locations/categories separated by commas when calling searchDatabase.</ACTIVE_FILTERS>`;
  }

  systemInstruction += `\n\n${CONVERSATION_FLOW_PROMPT}\n\n${PLANNING_PROMPT}\n\n${SUPPORT_PROMPT}\n\n${RESEARCH_PROMPT}`;

  if (itineraryState) {
    systemInstruction += `\n\n<CURRENT_ITINERARY>\n${itineraryState}\n</CURRENT_ITINERARY>`;
  }

  if (archetype && intensity && PSYCHOGRAPHIC_MATRIX[archetype]?.[intensity]) {
    systemInstruction += `\n\n<PSYCHOGRAPHIC_PROFILE>\nThe user is a [${archetype}] traveler seeking Intensity Level [${intensity}]. YOU MUST STRICTLY ALIGN YOUR RECOMMENDATIONS AND TONE WITH THIS EXACT DEFINITION: "${PSYCHOGRAPHIC_MATRIX[archetype][intensity]}".\nDo not suggest Level 3 intensity items to a Level 1 user, and vice versa. Adjust your conversational personality to match their risk tolerance and desires.\n</PSYCHOGRAPHIC_PROFILE>`;
  }

  const normalizedMessages = messages.map((msg: ChatMessage) => {
    if (!msg.parts && typeof msg.content === 'string') {
      return { ...msg, parts: [{ type: 'text', text: msg.content }] };
    }
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

  const modelMessages = await convertToModelMessages(normalizedMessages as Parameters<typeof convertToModelMessages>[0]);

  const result = streamText({
    model: getBaseModel(),
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

  return result;
}
