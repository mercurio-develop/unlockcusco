"use server";

import { prisma } from "@/lib/prisma";

export async function getRideStatus(id: string) {
  if (!id) {
    return { error: "Missing id parameter" };
  }

  try {
    let ride = await prisma.rideBooking.findUnique({
      where: { id: id },
      include: { driver: true, messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!ride) {
      ride = await prisma.rideBooking.findUnique({
        where: { stripeIntentId: id },
        include: { driver: true, messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!ride) {
      return { error: "Ride not found" };
    }

    return { ride };
  } catch (error) {
    console.error("Error fetching ride status:", error);
    return { error: "Failed to fetch ride status" };
  }
}