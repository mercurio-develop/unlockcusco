"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createTaxiPaymentIntent, notifyGhostPhone } from "../actions/process-taxi-payment";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");

interface TaxiPaymentCardProps {
  taxi: {
    originGuessed: string;
    destinationName: string;
    distanceKm: string;
    estimatedCostUSD: number;
    estimatedTimeMinutes: number;
    taxi?: {
      name: string;
      rating: number;
      whatsapp: string;
    }
  }
}

function CheckoutForm({ clientSecret, taxiDetails, onComplete }: { clientSecret: string, taxiDetails: TaxiPaymentCardProps['taxi'], onComplete: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required, but we are preventing redirect for this flow if possible
        // Actually, Stripe Elements usually redirects on success unless redirect="if_required"
        return_url: `${window.location.origin}/explore`, 
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage("Payment successful! Notifying driver...");
      const result = await notifyGhostPhone(paymentIntent.id);
      if (result.error) {
          setMessage(`Payment succeeded, but we couldn't reach the driver automatically. Please message them at ${taxiDetails.taxi?.whatsapp}`);
      } else {
          setMessage("Driver notified! Your taxi is on the way.");
      }
      onComplete();
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
          {isProcessing ? "Processing..." : `Pay $${taxiDetails.estimatedCostUSD}.00`}
        </span>
      </Button>
      {message && <div className="text-sm text-center text-rose-600 mt-2">{message}</div>}
    </form>
  );
}

export function TaxiPaymentCard({ taxi }: TaxiPaymentCardProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    createTaxiPaymentIntent({
        estimatedCostUSD: taxi.estimatedCostUSD,
        origin: taxi.originGuessed,
        destinationName: taxi.destinationName,
        driverName: taxi.taxi?.name,
    }).then((res) => {
        if (res.clientSecret) {
           setClientSecret(res.clientSecret);
        } else {
            console.error("Failed to fetch client secret:", res.error);
        }
    });
  }, [taxi]);

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

      {isCompleted ? (
         <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center">
             Booking Confirmed. Your driver has been notified.
         </div>
      ) : clientSecret ? (
        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
          <CheckoutForm clientSecret={clientSecret} taxiDetails={taxi} onComplete={() => setIsCompleted(true)} />
        </Elements>
      ) : (
        <div className="text-sm text-slate-500 text-center py-4">Preparing secure checkout...</div>
      )}
    </div>
  );
}
