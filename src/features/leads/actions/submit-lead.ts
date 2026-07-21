"use server";

import { prisma } from "@/lib/prisma";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";

interface LeadData {
  businessId: string;
  touristName: string;
  touristEmail: string;
  touristPhone?: string;
  date: Date;
}

export async function submitLead(data: LeadData): Promise<ActionState> {
  try {
    await prisma.lead.create({ data });
    return actionSuccess();
  } catch (error) {
    console.error("Failed to submit lead", error);
    return actionError("Failed to submit lead");
  }
}
