"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";

export async function legacyVerifyBusinessAction(
  businessId: string
): Promise<ActionState<{ slug: string }>> {
  if (!businessId) {
    return actionError("Missing required parameters");
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return actionError("Business not found");
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        isClaimed: true,
        verificationToken: null,
      },
    });

    ;(revalidateTag as (tag: string) => void)("businesses");
    return actionSuccess({ slug: business.slug });
  } catch (error) {
    console.error("Error verifying business:", error);
    return actionError("An unexpected error occurred");
  }
}
