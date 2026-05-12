"use server"
import { prisma } from "@/lib/prisma"

export async function trackBusinessView(businessId: string) {
  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { viewsCount: { increment: 1 } }
    })
  } catch (error) {
    console.error("Failed to track view", error)
  }
}
