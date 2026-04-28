"use server"

import { prisma } from "@/lib/prisma"

// SECURITY AUDIT NOTE:
// This action currently exposes a potential spam vector since anyone can trigger WhatsApp lead messages.
// NEXT STEPS:
// 1. Add rate-limiting based on the user's IP or session to prevent WhatsApp spam bots.
// 2. Add input validation using Zod for touristName and date fields.
export async function generateShadowLead(businessId: string, touristName: string, date: string) {
  if (!businessId || !touristName || !date) {
    throw new Error("Missing required fields for shadow lead generation.");
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    throw new Error("Business not found")
  }

  if (!business.whatsapp) {
    throw new Error("WhatsApp number not available for this business")
  }

  // Uses the public hostname instead of hardcoding INKAPORTAL.pe, using environment variable or a default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://INKAPORTAL.pe";
  const rawText = `Hello team at ${business.name}! 👋 Our AI assistant (INKAPORTAL) just recommended your business to ${touristName} for the date ${date}. Since your business is still an 'Unverified Profile', the tourist couldn't pay you directly on the platform. To receive the tourist's contact info and close this sale, click here to claim your profile for free: ${baseUrl}/claim/${businessId}`
  
  const encodedText = encodeURIComponent(rawText)
  
  return { success: true, url: `https://wa.me/51${business.whatsapp}?text=${encodedText}` }
}
