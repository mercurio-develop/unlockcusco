"use server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2023-10-16" as any,
});

export async function createRelayPaymentIntent({
  totalCostUSD,
  relayId
}: {
  totalCostUSD: number;
  relayId: string;
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCostUSD * 100, // Stripe expects cents
      currency: "usd",
      metadata: { type: "chrono-relay", relayId },
    });
    return { clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    console.error("Stripe error:", error);
    return { error: error.message };
  }
}
