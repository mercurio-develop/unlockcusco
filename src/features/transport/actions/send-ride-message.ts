"use server";

import { prisma } from "@/lib/prisma";

export async function sendRideMessage(rideId: string, text: string) {
  try {
    if (!rideId || !text) {
      return { error: "Missing rideId or text" };
    }

    // Since rideId could be the stripeIntentId from the frontend, we need to resolve it
    let ride = await prisma.rideBooking.findUnique({ where: { id: rideId } });
    
    if (!ride) {
      ride = await prisma.rideBooking.findUnique({ where: { stripeIntentId: rideId } });
    }

    if (!ride) {
      return { error: "Ride not found" };
    }

    const message = await prisma.rideMessage.create({
      data: {
        rideId: ride.id,
        sender: "TOURIST",
        text: text
      }
    });

    return { success: true, message };
  } catch (error) {
    console.error("Error creating ride message:", error);
    return { error: "Failed to send message" };
  }
}