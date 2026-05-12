"use server"
import { prisma } from "@/lib/prisma"

export async function trackAiRecommendation(businessId: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true }
    })

    if (!business) {
      console.warn(`Attempted to track AI recommendation for non-existent business: ${businessId}`)
      return
    }

    await prisma.business.update({
      where: { id: businessId },
      data: { aiRecommendationsCount: { increment: 1 } }
    })
  } catch (error) {
    console.error("Failed to track ai recommendation", error)
  }
}
