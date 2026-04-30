"use server"

import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/utils/encryption"

export async function saveTravelerManifest(tripId: string, travelers: any[]) {
  if (!tripId || !travelers || travelers.length === 0) {
    throw new Error("Invalid traveler payload")
  }

  const mappedTravelers = travelers.map((t, index) => ({
    tripId: tripId,
    isLeadGuest: index === 0,
    firstName: t.firstName, // Could encrypt, but useful for display
    lastName: t.lastName,   // Could encrypt, but useful for display
    passportNumber: encrypt(t.passportNumber) as string,
    nationality: t.nationality,
    dateOfBirth: new Date(t.dateOfBirth),
    whatsappNumber: index === 0 ? encrypt(t.whatsappNumber) : null,
    dietaryRestrictions: encrypt(t.dietaryRestrictions || null),
    medicalNotes: encrypt(t.medicalNotes || null),
  }))

  const result = await prisma.$transaction([
    prisma.traveler.createMany({
      data: mappedTravelers,
    }),
    prisma.trip.update({
      where: { id: tripId },
      data: { status: "BOOKED" }
    })
  ])

  return { success: true, count: result[0].count }
}
