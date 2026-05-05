"use server"

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RequestData {
  businessId: string;
  agencyName: string;
  agencyEmail: string;
  userName: string;
  userWhatsapp: string;
  date: string;
  experienceId: string;
  experienceTitle: string;
  notes: string;
}

export async function sendAvailabilityRequest(data: RequestData) {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { agencyName, agencyEmail, userName, userWhatsapp, date, experienceTitle, notes } = data;

    // Send to Business
    await resend.emails.send({
      from: "Vallecito <concierge@vallecito.pe>",
      to: agencyEmail || "reservas@jaguarllaqta.com", // Fallback for now
      subject: `New Expedition Request: ${experienceTitle} - ${userName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0E0E0E; border-bottom: 2px solid #C9A24D; padding-bottom: 10px;">Expedition Request</h2>
          <p>You have a new request from <strong>Vallecito</strong>.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Experience:</strong> ${experienceTitle}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Client:</strong> ${userName}</p>
            <p><strong>WhatsApp:</strong> <a href="https://wa.me/${userWhatsapp.replace(/\D/g, '')}">${userWhatsapp}</a></p>
          </div>
          
          <p><strong>Client Notes:</strong></p>
          <blockquote style="font-style: italic; border-left: 4px solid #C9A24D; padding-left: 15px; margin: 10px 0;">
            ${notes}
          </blockquote>
          
          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            This request was generated via Vallecito. Please contact the client directly via WhatsApp to finalize logistics.
          </p>
        </div>
      `,
    });

    // Send confirmation to User (Optional but good)
    await resend.emails.send({
      from: "Vallecito <concierge@vallecito.pe>",
      to: "tushita.dev@gmail.com", // For demo/user
      subject: `Your request for ${experienceTitle} has been sent!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0E0E0E;">Request Confirmed</h2>
          <p>Hi ${userName}, we've sent your request to <strong>${agencyName}</strong>.</p>
          <p>They will review your inquiry for <strong>${experienceTitle}</strong> on <strong>${date}</strong> and reach out to you via WhatsApp shortly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Safe travels,<br/>The Vallecito Team</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send request" };
  }
}
