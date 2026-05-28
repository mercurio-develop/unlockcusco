"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function verifyBusinessAction(businessId: string, token: string) {
  if (!businessId || !token) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return { success: false, error: "Business not found" };
    }

    if (business.verificationToken !== token) {
      return { success: false, error: "Invalid or expired verification token" };
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        isClaimed: true,
        verificationToken: null // One-time use
      }
    });

    ;(revalidateTag as (tag: string) => void)("businesses");
    return { success: true };
  } catch (error) {
    console.error("Error verifying business:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
