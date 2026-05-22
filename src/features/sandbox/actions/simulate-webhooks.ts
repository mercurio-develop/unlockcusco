"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { stripe } from "@/lib/config/stripe"

export async function simulateDriverAccept(rideId: string) {
  // Find a driver (or create a dummy one)
  let driver = await prisma.driver.findFirst()
  if (!driver) {
    driver = await prisma.driver.create({
      data: {
        name: "Carlos Mendoza (Test)",
        whatsappNumber: "+51987654321",
        carModel: "Toyota Yaris Silver",
        licensePlate: "ABC-123"
      }
    })
  }

  await prisma.rideBooking.update({
    where: { id: rideId },
    data: { 
      status: "DRIVER_ASSIGNED",
      driverId: driver.id,
      etaMinutes: 12 // Simulated ETA
    }
  })

  // Insert a system message
  await prisma.rideMessage.create({
    data: {
      rideId,
      sender: "SYSTEM",
      text: `Driver ${driver.name} is on the way. ETA: 12 minutes.`
    }
  })

  revalidatePath("/sandbox/dispatch")
  revalidatePath("/explore") // Assuming explore polls or shows Active Ride
}

export async function simulateDriverMessage(rideId: string, text: string) {
  await prisma.rideMessage.create({
    data: {
      rideId,
      sender: "DRIVER",
      text
    }
  })

  revalidatePath("/sandbox/dispatch")
  revalidatePath("/explore")
}

export async function simulateRideComplete(rideId: string) {
  const ride = await prisma.rideBooking.findUnique({ where: { id: rideId } })
  if (!ride || !ride.stripeIntentId) return { error: "No ride or stripe intent found" }

  try {
    // 1. Capture the Stripe Payment
    await stripe.paymentIntents.capture(ride.stripeIntentId)

    // 2. Update DB
    await prisma.rideBooking.update({
      where: { id: rideId },
      data: { status: "COMPLETED" }
    })

    // 3. System message
    await prisma.rideMessage.create({
      data: {
        rideId,
        sender: "SYSTEM",
        text: "Ride completed. Payment captured. Please remember to manually Yape the driver S/" + (ride.priceUsd * 3.7).toFixed(2)
      }
    })

    revalidatePath("/sandbox/dispatch")
    revalidatePath("/explore")
    return { success: true }
  } catch (error: unknown) {
    console.error("Stripe capture failed:", error)
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: message }
  }
}
