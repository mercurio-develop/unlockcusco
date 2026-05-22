import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/config/stripe';
import { handleStripeEvent } from '@/features/billing/services/stripe-webhook-service';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  await handleStripeEvent(event);

  return NextResponse.json({ received: true });
}
