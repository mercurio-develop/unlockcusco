"use server";

import { resend } from "@/lib/resend";

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "All fields are required" };
  }

  try {
    // If the API key is "dummy_key", we simulate success
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL && process.env.RESEND_API_KEY !== "dummy_key") {
      const { data, error } = await resend.emails.send({
        from: "UnlockCusco Contact <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Message from ${name}`,
        replyTo: email,
        text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
      });

      if (error) {
        return { error: error.message };
      }
    } else {
      console.log("No valid RESEND_API_KEY. Simulated sending contact email:", { name, email, message });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return { error: "Failed to send email. Please try again later." };
  }
}
