"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function claimBusiness(businessId: string, whatsapp: string, qrCodeUrl?: string) {
  if (!businessId) throw new Error("Business ID is required to claim.");
  if (!whatsapp) throw new Error("WhatsApp number is required to claim.");

  await prisma.business.update({
    where: { id: businessId },
    data: { 
      isClaimed: true,
      whatsapp: whatsapp,
      qrCodeUrl: qrCodeUrl || null
    },
  })

  revalidatePath(`/claim/${businessId}`)
  revalidatePath('/explore')
  revalidatePath('/dashboard')

  return { success: true }
}
