'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function submitPremiumOnboarding(formData: FormData) {
  try {
    const data = {
      slug: formData.get("slug") as string,
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      tagline: formData.get("tagline") as string,
      description: formData.get("description") as string,
      locationSlug: formData.get("locationSlug") as string,
      whatsapp: formData.get("whatsapp") as string,
      imageUrl: formData.get("imageUrl") as string,
      
      // Premium Profile
      logoUrl: formData.get("logoUrl") as string,
      coverPhotoUrl: formData.get("coverPhotoUrl") as string,
      primaryColor: formData.get("primaryColor") as string,
      accentColor: formData.get("accentColor") as string,
      fonts: formData.get("fonts") as string,
      visionStatement: formData.get("visionStatement") as string,
      
      // Pillars (Using JSON string from a hidden field or parsed)
      pillars: JSON.parse((formData.get("pillars") as string) || "[]"),
      
      // Packages
      tourPackages: JSON.parse((formData.get("tourPackages") as string) || "[]"),
    };

    if (!data.slug || !data.name) {
      throw new Error("Slug and Name are required");
    }

    const existing = await prisma.business.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      await prisma.business.delete({ where: { slug: data.slug } });
    }

    await prisma.business.create({
      data: {
        slug: data.slug,
        name: data.name,
        category: data.category,
        tagline: data.tagline,
        description: data.description,
        locationSlug: data.locationSlug,
        whatsapp: data.whatsapp,
        isAsociado: true,
        isClaimed: true,
        imageUrl: data.imageUrl,
        
        premiumProfile: {
          create: {
            logoUrl: data.logoUrl,
            coverPhotoUrl: data.coverPhotoUrl,
            primaryColor: data.primaryColor,
            accentColor: data.accentColor,
            fonts: data.fonts,
            visionStatement: data.visionStatement,
            pillars: {
              create: data.pillars
            }
          }
        },

        tourPackages: {
          create: data.tourPackages
        }
      }
    });

    revalidatePath('/explore');
    revalidatePath(`/business/${data.slug}`);
    
    return { success: true, message: `Successfully created premium profile for ${data.name}` };
  } catch (error: unknown) {
    console.error("Submission Error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message };
  }
}
