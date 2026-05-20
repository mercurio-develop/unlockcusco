import Stripe from 'stripe';

export async function handleStripeEvent(event: Stripe.Event) {
  if (event.type === 'payment_intent.succeeded') {
    // handle payment_intent.succeeded events here
  }
}
