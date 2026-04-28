import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock'
    );
  } catch (error: any) {
    // Return 400 for bad signatures
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // Handle successful payments
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // If it's a multi-stop chrono-relay payment
    if (paymentIntent.metadata.type === 'chrono-relay') {
      try {
        await fetch('http://localhost:4000/api/message/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer dev-secret'
          },
          body: JSON.stringify({
            phone: '+51999999999', // Admin phone placeholder
            message: `🚨 NEW BOOKING PAID. Escrow collected $${paymentIntent.amount / 100}.\nPlease Yape S/100 to Mateo and S/60 to the Cafe.\nRelay ID: ${paymentIntent.metadata.relayId}.\nReply 'DONE' to mark as settled.`
          })
        });
        console.log("Ghost phone alerted for Yape payout.");
      } catch (err) {
        console.error('Failed to notify ghost phone from webhook:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
