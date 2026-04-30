import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy"
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
      system: "You are an assistant.",
      messages: await convertToModelMessages(normalizedMessages)
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
  } catch (e) {
    console.error("CAUGHT ERROR:", e);
  }
}
main();
