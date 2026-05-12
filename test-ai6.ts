import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { generateText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  try {
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [{ role: 'user', content: 'hi' }]
    });
    console.log("RESULT:", result.text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
