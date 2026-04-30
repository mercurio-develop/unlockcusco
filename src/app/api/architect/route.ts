import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { macroTripSchema } from '@/lib/ai/schemas/planner-schema';
import { SYSTEM_PROMPT_CONCIERGE } from '@/lib/ai/prompts';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { dates, pax, exertionProfile, lenses, autonomy, needsHotels, pinnedPackageIds = [] } = await req.json();

    // 1. Trip Recycling Check
    const vibeTags = [...lenses].sort().join(',');
    const recycledTrip = await prisma.trip.findFirst({
      where: { 
        isVerifiedTemplate: true,
        paxCount: pax,
        templateVibeTags: { contains: vibeTags }
      },
      include: {
        days: { include: { tourPackage: true }, orderBy: { dayNumber: 'asc' } }
      }
    });

    if (recycledTrip) {
      const startDate = new Date(dates.start);
      const mappedDays = recycledTrip.days.map((d, index) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + index);
        return {
          dayNumber: d.dayNumber,
          date: currentDate.toISOString().split('T')[0],
          sleepTown: d.sleepTown,
          suggestedTourSector: d.tourPackage?.sector || "ANY",
          tourPackageId: d.tourPackage?.id,
          tourPackageTitle: d.tourPackage?.title,
          documentaryChapterTitle: d.dayTheme || "A journey of discovery.",
          expertOpportunity: d.guideNotes || undefined
        };
      });

      const clonedTemplate = {
        tripTitle: recycledTrip.tripTitle,
        narrativeArc: "A curated journey perfectly paced for your profile.",
        totalDays: recycledTrip.days.length,
        baseCampStrategy: recycledTrip.baseCampStrategy,
        days: mappedDays
      };

      console.log("♻️ Serving recycled trip template:", recycledTrip.id);
      return new Response(JSON.stringify(clonedTemplate), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Fetch Curated Tour Packages (Lego Bricks)
    const availablePackages = await prisma.tourPackage.findMany({
      select: {
        id: true,
        title: true,
        sector: true,
        pace: true,
        description: true,
        tags: true,
      }
    });
    
    const packagesContext = availablePackages.map(p => 
      `- ID: ${p.id} | Title: "${p.title}" | Sector: ${p.sector} | Pace: ${p.pace} | Tags: ${p.tags}\n  Description: ${p.description}`
    ).join('\n\n');

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
    });

    const prompt = `I have completed the Journey Architect. Here is my profile:
Dates: ${dates.start} to ${dates.end}
Travelers: ${pax}
Exertion Profile: ${exertionProfile}
Lenses of Discovery: ${lenses.join(', ')}
Autonomy Ratio: ${autonomy}
Needs Hotels: ${needsHotels ? 'Yes' : 'No'}

Here is the library of our curated Tour Packages (Lego Bricks). You MUST use these specific packages to build the daily itinerary whenever appropriate. Select the packages that best match my exertion profile, pace, and interests.

CURATED TOUR PACKAGES:
${packagesContext}

Please generate my macro trip plan according to the Nat Geo Narrative Arc. Make sure to assign specific towns to sleep in to respect the Biological Pacing (e.g. Urubamba/Ollantaytambo first). For each day, assign the most appropriate 'tourPackageId' and 'tourPackageTitle' from the list above. If a day is purely for rest or transit and no package fits, you may omit the package for that day.${
  pinnedPackageIds.length > 0
    ? `\n\nCRITICAL: The traveler hand-picked these highlight experiences. You MUST assign all of them to the most appropriate days — do not skip any:\n${
        availablePackages
          .filter((p: { id: string }) => pinnedPackageIds.includes(p.id))
          .map((p: { id: string; title: string; sector: string }) => `- ID: ${p.id} | "${p.title}" | Sector: ${p.sector}`)
          .join('\n')
      }`
    : ''
}`;

    const { output } = await generateText({
      model: google('gemini-2.5-pro'),
      system: SYSTEM_PROMPT_CONCIERGE,
      output: Output.object({ schema: macroTripSchema }),
      prompt,
    });

    return new Response(JSON.stringify(output), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Architect Generation Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
