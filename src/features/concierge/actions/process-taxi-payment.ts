"use server"

import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2023-10-16" as any,
});

const RequestSchema = z.object({
  estimatedCostUSD: z.number(),
  origin: z.string(),
  destinationName: z.string(),
  driverName: z.string().optional(),
});

export async function createTaxiPaymentIntent(data: z.infer<typeof RequestSchema>) {
  const result = RequestSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid request payload." };
  }

  const { estimatedCostUSD, origin, destinationName, driverName } = result.data;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: estimatedCostUSD * 100, // Stripe expects cents
      currency: "usd",
      metadata: {
        origin,
        destinationName,
        driverName: driverName || "Default Driver",
      },
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return { error: "Failed to initialize payment." };
  }
}

export async function notifyGhostPhone(paymentIntentId: string) {
  try {
      // In a real app, you would retrieve the payment intent to verify status
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
          return { error: "Payment not successful." };
      }

      const { origin, destinationName, driverName } = paymentIntent.metadata;

      // Mock webhook call to Ghost Phone microservice
      const webhookUrl = process.env.GHOST_PHONE_WEBHOOK_URL || "http://localhost:3001/webhook";
      
      const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              type: "TAXI_BOOKING",
              data: {
                  origin,
                  destinationName,
                  driverName,
                  amountPaid: paymentIntent.amount / 100,
                  status: paymentIntent.status,
              }
          })
      });

      if (!response.ok) {
         console.warn("Ghost Phone webhook failed, but payment succeeded.");
         // We might return success anyway to the user since they paid, but log it.
      }

      return { success: true };

  } catch (error) {
      console.error("Error notifying Ghost Phone:", error);
      return { error: "Failed to notify driver." };
  }
}
