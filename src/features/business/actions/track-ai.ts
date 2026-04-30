"use server"
import { prisma } from "@/lib/prisma"

export async function trackAiRecommendation(businessId: string) {
  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { aiRecommendationsCount: { increment: 1 } }
    })
  } catch (error) {
    console.error("Failed to track ai recommendation", error)
  }
}
