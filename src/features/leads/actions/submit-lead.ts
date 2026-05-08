"use server"
import { prisma } from "@/lib/prisma"

interface LeadData {
  businessId: string
  touristName: string
  touristEmail: string
  touristPhone?: string
  date: Date
}

export async function submitLead(data: LeadData) {
  try {
    await prisma.lead.create({
      data
    })
  } catch (error) {
    console.error("Failed to submit lead", error)
    throw new Error("Failed to submit lead")
  }
}
