"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function legacyVerifyBusinessAction(businessId: string) {
  if (!businessId) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return { success: false, error: "Business not found" };
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        isClaimed: true,
        verificationToken: null // Clear any pending token just in case
      }
    });

    ;(revalidateTag as (tag: string) => void)("businesses");
    return { success: true, slug: business.slug };
  } catch (error) {
    console.error("Error verifying business:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
