"use server"

import { prisma } from "@/lib/prisma"

export async function claimBusiness(businessId: string) {
  await prisma.business.update({
    where: { id: businessId },
    data: { isClaimed: true },
  })
  return { success: true }
}
