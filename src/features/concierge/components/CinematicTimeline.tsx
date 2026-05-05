import { Business } from "@prisma/client";
"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { createRelayPaymentIntent } from "../actions/process-relay-payment";
import { useItinerary } from "@/lib/store/itinerary-context";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");

function RelayCheckoutForm({ clientSecret, totalCostUSD, onComplete }: { clientSecret: string, totalCostUSD: number, onComplete: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/explore`, 
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage("Payment successful!");
      onComplete();
    } else {
      setMessage("Payment is processing...");
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <PaymentElement />
      <Button disabled={isProcessing || !stripe || !elements} className="w-full bg-[#D4AF37] text-black hover:bg-[#C5A059]">
        {isProcessing ? "Processing..." : `Pay $${totalCostUSD}.00`}
      </Button>
      {message && <div className="text-sm text-center text-rose-400 mt-2">{message}</div>}
    </form>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CinematicTimeline({ relay }: { relay: any }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { setPanelMode } = useItinerary();

  useEffect(() => {
    setPanelMode("itinerary");
    createRelayPaymentIntent({
        totalCostUSD: relay.totalCost,
        relayId: `${relay.origin}-${relay.destination}`,
    }).then((res) => {
        if (res.clientSecret) setClientSecret(res.clientSecret);
    });
  }, [relay, setPanelMode]);

  return (
    <div className="bg-[#09090B]/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-5 w-full my-4 text-white font-sans">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-[#D4AF37]/20 p-1.5 rounded-md border border-[#D4AF37]/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <h3 className="font-serif text-sm tracking-widest uppercase text-[#D4AF37] opacity-90">Secured Timeline</h3>
      </div>
      
      <div className="relative pl-6 border-l border-white/10 space-y-8 pb-4">
        {/* Food */}
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
          <h4 className="text-sm font-semibold text-white/90 tracking-wide">1. TASTE <span className="text-white/40 font-normal">({relay.foodLocation || relay.origin})</span></h4>
          <p className="text-sm text-white/70 mt-1">{relay.food.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">★ {relay.food.rating}</span>
            <span className="text-xs text-white/40">{relay.food.distance}</span>
          </div>
        </div>

        {/* Transit */}
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
          <h4 className="text-sm font-semibold text-white/90 tracking-wide">2. TRANSIT</h4>
          <p className="text-sm text-white/70 mt-1">{relay.transit.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">Driver: {relay.transit.driver}</span>
            <span className="text-xs text-white/40">{relay.distanceKm} km</span>
          </div>
        </div>

        {/* Stay */}
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
          <h4 className="text-sm font-semibold text-white/90 tracking-wide">3. REST <span className="text-white/40 font-normal">({relay.destination})</span></h4>
          <p className="text-sm text-white/70 mt-1">{relay.stay.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">★ {relay.stay.rating}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-white/60">Total Logistics</span>
          <span className="text-lg font-semibold text-white">${relay.totalCost}.00</span>
        </div>

        {isCompleted ? (
          <div className="bg-green-500/10 text-green-400 p-3 rounded-lg text-sm text-center border border-green-500/20 flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Booking Confirmed. Relay secured.
          </div>
        ) : clientSecret ? (
          <Elements options={{ clientSecret, appearance: { theme: 'night' } }} stripe={stripePromise}>
            <RelayCheckoutForm clientSecret={clientSecret} totalCostUSD={relay.totalCost} onComplete={() => setIsCompleted(true)} />
          </Elements>
        ) : (
          <div className="text-sm text-white/40 text-center flex items-center justify-center gap-2">
            <div className="animate-spin w-3 h-3 border-2 border-[#D4AF37] border-t-transparent rounded-full" />
            Preparing secure checkout...
          </div>
        )}
      </div>
    </div>
  );
}
