"use server"

import { prisma } from "@/lib/prisma"

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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vallecito.app";
  
  let contextNote = "recommended your business";
  if (business.category === 'DINING') contextNote = "recommended your restaurant/cafe";
  else if (business.category === 'STAYS' || business.category === 'STAY') contextNote = "recommended your accommodation";
  else if (business.category === 'WELLNESS') contextNote = "recommended your wellness services";
  else if (business.category === 'TRANSPORT') contextNote = "recommended your transport services";

  const rawText = `Hello team at ${business.name}! 👋 Our AI assistant (VALLECITO) just ${contextNote} to ${touristName} for the date ${date}.\n\nSince your profile is still 'Unverified', the tourist couldn't message you directly. To receive the tourist's contact info and close this sale, click here to activate your free profile: ${baseUrl}/claim/${businessId}`

  const ghostPhoneUrl = process.env.GHOST_PHONE_URL || "http://localhost:4000";
  const webhookSecret = process.env.WEBHOOK_SECRET || "dev-secret";

  try {
    const response = await fetch(`${ghostPhoneUrl}/api/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookSecret}`
      },
      body: JSON.stringify({
        phone: business.whatsapp,
        message: rawText
      })
    });

    if (!response.ok) {
      console.warn("Ghost Phone webhook failed, falling back to client-side wa.me link", await response.text());
      return { success: true, url: `https://wa.me/51${business.whatsapp}?text=${encodeURIComponent(rawText)}` };
    }

    return { success: true, delivered: true };
  } catch (error) {
    console.warn("Failed to reach Ghost Phone, falling back to client-side wa.me link", error);
    return { success: true, url: `https://wa.me/51${business.whatsapp}?text=${encodeURIComponent(rawText)}` };
  }
}
