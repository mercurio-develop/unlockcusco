import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { trip, dates, pax } = await req.json();

    const shareToken = `vll-${crypto.randomBytes(6).toString('hex')}`;

    const startDate = new Date(dates.start);
    const endDate = new Date(dates.end);

    const savedTrip = await prisma.trip.create({
      data: {
        tripTitle: trip.tripTitle || 'Custom Vallecito Expedition',
        startDate,
        endDate,
        paxCount: pax || 1,
        baseCampStrategy: trip.baseCampStrategy || 'Multiple Basecamps',
        shareToken,
        status: 'CONFIRMED_UNPAID', // Unlocked via wizard paywall
        days: {
          create: (trip.days || []).map((day: any, idx: number) => {
            const current = new Date(startDate);
            current.setDate(current.getDate() + idx);
            return {
              dayNumber: day.dayNumber || idx + 1,
              date: current,
              sleepTown: day.sleepTown || 'Urubamba',
              dayTheme: day.documentaryChapterTitle || 'A journey of discovery.',
              tourPackageId: day.tourPackageId || null,
              guideNotes: day.expertOpportunity || null,
            };
          })
        }
      }
    });

    return NextResponse.json({ success: true, shareToken: savedTrip.shareToken });
  } catch (error) {
    console.error("Error saving trip:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
