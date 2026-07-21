"use server";

import { prisma } from "@/lib/prisma";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";

export async function sendRideMessage(
  rideId: string,
  text: string
): Promise<ActionState<{ message: unknown }>> {
  try {
    if (!rideId || !text) {
      return actionError("Missing rideId or text");
    }

    let ride = await prisma.rideBooking.findUnique({ where: { id: rideId } });

    if (!ride) {
      ride = await prisma.rideBooking.findUnique({
        where: { stripeIntentId: rideId },
      });
    }

    if (!ride) {
      return actionError("Ride not found");
    }

    const message = await prisma.rideMessage.create({
      data: {
        rideId: ride.id,
        sender: "TOURIST",
        text,
      },
    });

    return actionSuccess({ message });
  } catch (error) {
    console.error("Error creating ride message:", error);
    return actionError("Failed to send message");
  }
}
