import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { buildItinerary } from './src/lib/ai/tools/build-itinerary';
import { askAvailability } from './src/lib/ai/tools/ask-availability';
import { searchDatabase } from './src/lib/ai/tools/search-database';
import { buildMacroTrip } from './src/lib/ai/tools/build-macro-trip';
import { showBoletoInfo } from './src/lib/ai/tools/show-boleto-info';
import { SYSTEM_PROMPT_CONCIERGE } from './src/lib/ai/prompts';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

const messages = [
  {
    "id": "1",
    "role": "assistant",
    "content": "Welcome to Vallecito. ✨\n\nHow can I curate your day in the Sacred Valley?"
  },
  {
    "parts": [
      {
        "type": "text",
        "text": "I need a taxi from Urubamba to Pisac"
      }
    ],
    "id": "AbqjkCSVzaOVSGtW",
    "role": "user"
  }
];

async function main() {
  try {
    const normalizedMessages = messages.map((msg: any) => {
      if (!msg.parts && msg.content) {
        return { ...msg, parts: [{ type: 'text', text: msg.content }] };
      }
      return msg;
    });

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: SYSTEM_PROMPT_CONCIERGE,
      messages: await convertToModelMessages(normalizedMessages),
      tools: {
        buildItinerary,
        askAvailability,
        searchDatabase,
        buildMacroTrip,
        showBoletoInfo,
      },
    });

    for await (const chunk of result.fullStream) {
      console.log(chunk);
    }
  } catch (e) {
    console.error("CAUGHT ERROR:", e);
  }
}
main();
