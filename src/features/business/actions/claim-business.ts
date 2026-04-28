"use server"

import { prisma } from "@/lib/prisma"

// SECURITY AUDIT NOTE: 
// Currently, this action is unauthenticated and can be called by anyone to claim a business.
// NEXT STEPS:
// 1. Integrate next-auth to ensure the user is logged in.
// 2. Validate Stripe Webhook event to ensure payment succeeded before marking as claimed.
// 3. Connect the claimed business to the authenticated user's ID.
export async function claimBusiness(businessId: string) {
  if (!businessId) throw new Error("Business ID is required to claim.");

  // Mock verification for the moment
  await prisma.business.update({
    where: { id: businessId },
    data: { isClaimed: true },
  })
  
  return { success: true }
}
