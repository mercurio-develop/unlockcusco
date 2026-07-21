"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";

export async function verifyBusinessAction(
  businessId: string,
  token: string
): Promise<ActionState> {
  if (!businessId || !token) {
    return actionError("Missing required parameters");
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return actionError("Business not found");
    }

    if (business.verificationToken !== token) {
      return actionError("Invalid or expired verification token");
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        isClaimed: true,
        verificationToken: null,
      },
    });

    ;(revalidateTag as (tag: string) => void)("businesses");
    return actionSuccess();
  } catch (error) {
    console.error("Error verifying business:", error);
    return actionError("An unexpected error occurred");
  }
}
