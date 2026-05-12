import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/config/stripe';

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
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    // handle payment_intent.succeeded events here
  }

  return NextResponse.json({ received: true });
}
