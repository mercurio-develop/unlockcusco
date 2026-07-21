import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/config/site";
import {
  LOCALES,
  businessPath,
  exploreCategoryPath,
  explorePath,
  gearPath,
  guidesPath,
  homePath,
} from "@/paths";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const businesses = await prisma.business.findMany({
    select: { slug: true },
  });

  const combinations = await prisma.business.groupBy({
    by: ["locationSlug", "category"],
  });

  const routes = LOCALES.flatMap((lang) => [
    {
      url: `${siteConfig.url}${homePath(lang)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${siteConfig.url}${explorePath(lang)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}${guidesPath(lang)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}${gearPath(lang)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ]);

  const businessRoutes = businesses.flatMap((business) =>
    LOCALES.map((lang) => ({
      url: `${siteConfig.url}${businessPath(lang, business.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  const exploreRoutes = combinations
    .filter((c) => c.locationSlug && c.category)
    .flatMap((c) =>
      LOCALES.map((lang) => ({
        url: `${siteConfig.url}${exploreCategoryPath(
          lang,
          c.locationSlug!,
          c.category!
        )}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );

  return [...routes, ...businessRoutes, ...exploreRoutes];
}
