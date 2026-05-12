"use server"
import { prisma } from "@/lib/prisma"

export async function trackWhatsappClick(businessId: string) {
  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { whatsappClicksCount: { increment: 1 } }
    })
  } catch (error) {
    console.error("Failed to track click", error)
  }
}
