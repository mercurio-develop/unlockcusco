"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAffiliateLinks } from "@/lib/utils/travelpayouts";
import type { Prisma } from "@prisma/client";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";

export async function generateTrackedLink(
  url: string
): Promise<ActionState<{ partnerUrl: string }>> {
  if (!url) return actionError("URL is required");
  try {
    const result = await generateAffiliateLinks([{ url }]);
    if (result && result.length > 0) {
      const linkResult = result[0];
      if (linkResult.code === "failed") {
        return actionError(
          (linkResult as { message?: string }).message ||
            "Failed to generate link"
        );
      }
      const partnerUrl = linkResult.partner_url || linkResult.url;
      if (!partnerUrl) {
        return actionError("No shortlink returned in Travelpayouts response");
      }
      return actionSuccess({ partnerUrl });
    }
    return actionError("No link returned from Travelpayouts");
  } catch (error: unknown) {
    console.error("Failed generating affiliate link:", error);
    return actionError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function saveAffiliateLink(
  businessId: string,
  provider: string,
  url: string
): Promise<ActionState> {
  if (!businessId || !provider || !url) {
    return actionError("Business ID, provider, and URL are required");
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) return actionError("Business not found");

    let links: Array<{ provider: string; url: string }> = [];
    if (business.affiliateLinks && Array.isArray(business.affiliateLinks)) {
      links = business.affiliateLinks as unknown as Array<{
        provider: string;
        url: string;
      }>;
    }

    links = links.filter(
      (l) => l.provider.toLowerCase() !== provider.toLowerCase()
    );
    links.push({ provider, url });

    await prisma.business.update({
      where: { id: businessId },
      data: {
        affiliateLinks: links as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/business/${business.slug}`);
    revalidatePath("/explore");

    return actionSuccess();
  } catch (error: unknown) {
    console.error("Failed saving affiliate link:", error);
    return actionError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function deleteAffiliateLink(
  businessId: string,
  provider: string
): Promise<ActionState> {
  if (!businessId || !provider) {
    return actionError("Business ID and provider are required");
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) return actionError("Business not found");

    if (business.affiliateLinks && Array.isArray(business.affiliateLinks)) {
      let links = business.affiliateLinks as unknown as Array<{
        provider: string;
        url: string;
      }>;
      links = links.filter(
        (l) => l.provider.toLowerCase() !== provider.toLowerCase()
      );

      await prisma.business.update({
        where: { id: businessId },
        data: {
          affiliateLinks: links as unknown as Prisma.InputJsonValue,
        },
      });

      revalidatePath(`/business/${business.slug}`);
      revalidatePath("/explore");
    }

    return actionSuccess();
  } catch (error: unknown) {
    console.error("Failed deleting affiliate link:", error);
    return actionError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
