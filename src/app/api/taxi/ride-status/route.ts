import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // This could be ride.id or stripeIntentId

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    let ride = await prisma.rideBooking.findUnique({
      where: { id: id },
      include: { driver: true, messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!ride) {
      // Fallback: search by stripe intent ID
      ride = await prisma.rideBooking.findUnique({
        where: { stripeIntentId: id },
        include: { driver: true, messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json({ ride });
  } catch (error) {
    console.error("Error fetching ride status:", error);
    return NextResponse.json({ error: "Failed to fetch ride status" }, { status: 500 });
  }
}
