"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { createTaxiPaymentIntent, notifyGhostPhone } from "@/features/concierge/actions/process-taxi-payment";
import { ActiveRideHub } from "./ActiveRideHub";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");

interface TaxiDetails {
  originGuessed: string;
  destinationName: string;
  estimatedCostUSD: number;
  estimatedTimeMinutes: number;
  distanceKm: string;
  taxi?: {
    name: string;
    rating: number;
    whatsapp: string;
  }
}

interface CheckoutFormProps {
  clientSecret: string;
  taxiDetails: TaxiDetails;
  onComplete: (paymentIntentId: string) => void;
}

function CheckoutForm({ clientSecret, taxiDetails, onComplete }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/explore`, // In real app, maybe a deep link
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded")) {
      setMessage("Payment secured! Notifying driver...");
      const result = await notifyGhostPhone(paymentIntent.id);
      if (result.error) {
          setMessage(`Hold secured, but we couldn't reach the driver automatically.`);
      } else {
          setMessage("Driver notified! Your taxi is on the way.");
      }
      onComplete(paymentIntent.id);
    } else {
      setMessage("Payment is processing...");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button disabled={isProcessing || !stripe || !elements} className="w-full bg-slate-900 text-white hover:bg-slate-800">
        <span id="button-text">
          {isProcessing ? "Processing..." : `Secure Hold for $${taxiDetails.estimatedCostUSD}.00`}
        </span>
      </Button>
      {message && <div className="text-sm text-center text-rose-600 mt-2">{message}</div>}
    </form>
  );
}

interface TaxiPaymentCardProps {
  taxi: TaxiDetails;
}

export function TaxiPaymentCard({ taxi }: TaxiPaymentCardProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [completedIntentId, setCompletedIntentId] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    createTaxiPaymentIntent({
        estimatedCostUSD: taxi.estimatedCostUSD,
        origin: taxi.originGuessed,
        destinationName: taxi.destinationName,
    }).then((res) => {
        if (res.clientSecret) {
           setClientSecret(res.clientSecret);
        } else {
            console.error("Failed to fetch client secret:", res.error);
        }
    });
  }, [taxi]);

  if (completedIntentId) {
    // Render the Active Ride view instead of the checkout form
    // Since we only have the Stripe Intent ID on the client, the ActiveRideHub needs to fetch the RideBooking ID,
    // OR we pass the Intent ID to ActiveRideHub and it queries by that.
    // For simplicity, we'll assume ActiveRideHub accepts stripeIntentId or rideId.
    // Let's modify ActiveRideHub locally if it needs to fetch by stripeIntentId.
    // Actually, wait, our server action `notifyGhostPhone` is triggered on success,
    // but the backend needs a way to let the UI fetch the ride.
    // Let's create an API route for ActiveRideHub to fetch status.
    return (
      <ActiveRideHub 
        rideId={completedIntentId} // We pass the stripe intent ID here temporarily, though we need the real DB rideId.
        origin={taxi.originGuessed}
        destinationName={taxi.destinationName}
      />
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 max-w-sm w-full mx-auto my-4 text-slate-900">
      <h3 className="font-serif text-lg font-semibold mb-1">Book a Taxi</h3>
      
      <div className="text-sm text-slate-600 mb-4 space-y-1">
          <div className="flex justify-between">
              <span>From:</span>
              <span className="font-medium text-slate-900">{taxi.originGuessed}</span>
          </div>
          <div className="flex justify-between">
              <span>To:</span>
              <span className="font-medium text-slate-900">{taxi.destinationName}</span>
          </div>
          <div className="flex justify-between">
              <span>Est. Time:</span>
              <span>{taxi.estimatedTimeMinutes} mins ({taxi.distanceKm} km)</span>
          </div>
      </div>

      {taxi.taxi && (
         <div className="bg-gray-50 rounded p-2 mb-4 text-xs border border-gray-100">
             <p className="font-medium text-slate-900">{taxi.taxi.name}</p>
             <p className="text-slate-500">Rating: {taxi.taxi.rating} ★</p>
         </div>
      )}

      {clientSecret ? (
        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
          <CheckoutForm clientSecret={clientSecret} taxiDetails={taxi} onComplete={(id) => setCompletedIntentId(id)} />
        </Elements>
      ) : (
        <div className="text-sm text-slate-500 text-center py-4">Preparing secure checkout...</div>
      )}
    </div>
  );
}
