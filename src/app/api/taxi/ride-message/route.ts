import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { rideId, text } = await request.json();

    if (!rideId || !text) {
      return NextResponse.json({ error: "Missing rideId or text" }, { status: 400 });
    }

    // Since rideId could be the stripeIntentId from the frontend, we need to resolve it
    let ride = await prisma.rideBooking.findUnique({ where: { id: rideId } });
    
    if (!ride) {
      ride = await prisma.rideBooking.findUnique({ where: { stripeIntentId: rideId } });
    }

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    const message = await prisma.rideMessage.create({
      data: {
        rideId: ride.id,
        sender: "TOURIST",
        text: text
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error creating ride message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
