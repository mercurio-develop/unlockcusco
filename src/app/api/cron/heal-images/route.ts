import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { prisma } from "@/lib/prisma";
import {
  APIFY_ACTOR_ID,
  APIFY_ACTOR_INPUT,
  type BusinessImageRecord,
  auditBrokenImages,
  findApifyMatch,
  getApifySearchQuery,
  getHomepageBrokenTargets,
  resolveApifyImage,
} from "../../../../../scripts/utils/image-health";

export const maxDuration = 300;

const CRON_RUN_LIMIT = 10;

async function healTargets(targets: BusinessImageRecord[]): Promise<number> {
  if (targets.length === 0 || !process.env.APIFY_API_TOKEN) return 0;

  const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  const queries = targets.map(getApifySearchQuery);

  const run = await apifyClient.actor(APIFY_ACTOR_ID).call({
    searchStringsArray: queries,
    ...APIFY_ACTOR_INPUT,
  });

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  let fixedCount = 0;

  for (const target of targets) {
    const match = findApifyMatch(target, items as Record<string, unknown>[]);
    if (!match) continue;

    const enhanced = resolveApifyImage(match);
    if (!enhanced) continue;

    await prisma.business.update({
      where: { id: target.id },
      data: { imageUrl: enhanced },
    });
    fixedCount++;
    console.log(`   ✅ Healed "${target.name}"`);
  }

  return fixedCount;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("🔄 Starting Image Healing CRON job...");

    const homepageBroken = await getHomepageBrokenTargets(prisma);
    const homepageIds = new Set(homepageBroken.map((business) => business.id));

    const globalBusinesses = await prisma.business.findMany({
      where: { imageUrl: { not: "" } },
      orderBy: { reviewsCount: "desc" },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        googleMapsUrl: true,
        googlePlaceId: true,
        category: true,
        locationSlug: true,
        reviewsCount: true,
      },
    });

    const globalBroken = (await auditBrokenImages(globalBusinesses)).filter(
      (business) => !homepageIds.has(business.id),
    );

    const prioritizedBroken = [...homepageBroken, ...globalBroken].slice(0, CRON_RUN_LIMIT);

    console.log(
      `Found ${homepageBroken.length} homepage + ${globalBroken.length} global broken images; healing ${prioritizedBroken.length} this run.`,
    );

    if (prioritizedBroken.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All images are healthy.",
        brokenCount: 0,
        fixedCount: 0,
      });
    }

    const fixedCount = await healTargets(prioritizedBroken);

    console.log(`🎉 CRON Finished. Fixed ${fixedCount}/${prioritizedBroken.length} broken images.`);

    return NextResponse.json({
      success: true,
      message: "Healing complete.",
      brokenCount: homepageBroken.length + globalBroken.length,
      healedThisRun: prioritizedBroken.length,
      fixedCount,
    });
  } catch (error) {
    console.error("Fatal error in heal-images CRON:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
