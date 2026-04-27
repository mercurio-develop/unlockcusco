"use server"

import { prisma } from "@/lib/prisma"
import { GoogleGenAI } from "@google/genai"

export async function askConcierge(message: string, language: string = "English") {
  try {
    // 1. Fetch top 20 highest-rated businesses from DB to use as local context
    // This gives the AI real data to answer with instead of hallucinating places.
    const businesses = await prisma.business.findMany({
      take: 20,
      orderBy: { rating: 'desc' }
    })

    const contextData = businesses.map(b => 
      `- ${b.name} (Category: ${b.category}, Rating: ${b.rating}, Claimed: ${b.isClaimed ? 'Yes' : 'No'})`
    ).join('\n')

    // 2. Fallback if no API key is provided
    if (!process.env.GEMINI_API_KEY) {
      // Very basic mock if no AI
      const lowerMsg = message.toLowerCase()
      let matches = businesses.filter(b => lowerMsg.includes(b.category.toLowerCase()))
      if (matches.length === 0) matches = businesses.slice(0, 2)
      
      if (language === "Spanish") {
        return `¡Qué buena idea! Te sugiero visitar **${matches.map(m => m.name).join(' o ')}**. (Añade tu GEMINI_API_KEY en el archivo .env para respuestas inteligentes y personalizadas).`
      } else {
        return `Great idea! I recommend visiting **${matches.map(m => m.name).join(' or ')}**. (Add your GEMINI_API_KEY to the .env file for smart, personalized responses).`
      }
    }

    // 3. Prompt engineering with dynamic i18n
    const prompt = `
    You are the AI Concierge for "InkaPortal", an ultra-premium travel platform for the Sacred Valley in Peru.
    Your tone must be extremely elegant, concise, helpful, and "Apple-level minimal". 
    CRITICAL: You MUST speak in ${language}.
    
    The user asked: "${message}"

    Here is a list of verified businesses in our database:
    ${contextData}

    Task: Recommend 1 or 2 businesses from the list above that best match the user's request. 
    Explain why in a short, cinematic sentence. Use markdown for bold text on the business names. Do not hallucinate businesses that are not on the list.
    `

    // 4. Call the new Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    return response.text || "Sorry, the fog in the Andes prevents me from connecting. Try again."
  } catch (error) {
    console.error("Error in askConcierge:", error)
    return "An error occurred while consulting the InkaPortal oracle. Please try again later."
  }
}
