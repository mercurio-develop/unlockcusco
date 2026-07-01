"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateAffiliateLinks } from "@/lib/utils/travelpayouts"
import type { Prisma } from "@prisma/client"

export async function generateTrackedLink(url: string) {
  if (!url) return { error: "URL is required" }
  try {
    const result = await generateAffiliateLinks([{ url }])
    if (result && result.length > 0) {
      const linkResult = result[0]
      if (linkResult.code === "failed") {
        return { error: (linkResult as any).message || "Failed to generate link" }
      }
      // If shorten: true was sent, Travelpayouts returns the shortened link in partner_url or url
      const partnerUrl = linkResult.partner_url || linkResult.url
      if (!partnerUrl) {
        return { error: "No shortlink returned in Travelpayouts response" }
      }
      return { success: true, partnerUrl }
    }
    return { error: "No link returned from Travelpayouts" }
  } catch (error: any) {
    console.error("Failed generating affiliate link:", error)
    return { error: error.message || "Unknown error" }
  }
}

export async function saveAffiliateLink(businessId: string, provider: string, url: string) {
  if (!businessId || !provider || !url) {
    return { error: "Business ID, provider, and URL are required" }
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) return { error: "Business not found" }

    // Parse existing links or initialize new array
    let links: Array<{ provider: string; url: string }> = []
    if (business.affiliateLinks && Array.isArray(business.affiliateLinks)) {
      links = business.affiliateLinks as unknown as Array<{ provider: string; url: string }>
    }

    // Filter out existing links with the same provider to avoid duplicates
    links = links.filter(l => l.provider.toLowerCase() !== provider.toLowerCase())

    // Add the new link
    links.push({ provider, url })

    // Save back to DB
    await prisma.business.update({
      where: { id: businessId },
      data: {
        affiliateLinks: links as unknown as Prisma.InputJsonValue
      }
    })

    revalidatePath(`/business/${business.slug}`)
    revalidatePath("/explore")
    
    return { success: true }
  } catch (error: any) {
    console.error("Failed saving affiliate link:", error)
    return { error: error.message || "Unknown error" }
  }
}

export async function deleteAffiliateLink(businessId: string, provider: string) {
  if (!businessId || !provider) {
    return { error: "Business ID and provider are required" }
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) return { error: "Business not found" }

    if (business.affiliateLinks && Array.isArray(business.affiliateLinks)) {
      let links = business.affiliateLinks as unknown as Array<{ provider: string; url: string }>
      links = links.filter(l => l.provider.toLowerCase() !== provider.toLowerCase())

      await prisma.business.update({
        where: { id: businessId },
        data: {
          affiliateLinks: links as unknown as Prisma.InputJsonValue
        }
      })

      revalidatePath(`/business/${business.slug}`)
      revalidatePath("/explore")
    }

    return { success: true }
  } catch (error: any) {
    console.error("Failed deleting affiliate link:", error)
    return { error: error.message || "Unknown error" }
  }
}
