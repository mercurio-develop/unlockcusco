"use client";

import { MapPin, Star, Activity, Utensils, Car, Zap } from 'lucide-react';

type Plan = {
  planId: string;
  combinedRating: number;
  totalDistanceKm: string;
  morning: {
    name: string;
    rating: number;
  };
  afternoon: {
    name: string;
    rating: number;
  };
};

export default function ItineraryAlternatives({ plans }: { plans: Plan[] }) {
  return (
    <div className="w-full my-6 flex flex-col gap-6">
      <div className="text-[#D4AF37] text-xs font-mono uppercase tracking-widest flex items-center gap-2">
        <MapPin size={14} /> InkaPortal Smart Routes Found
      </div>
      {plans.map((plan, index) => (
        <div
          key={plan.planId}
          className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col relative backdrop-blur-xl shadow-lg hover:border-[#D4AF37]/50 transition-colors"
        >
          <div className="flex justify-between items-center mb-6">
            <span className="text-white font-serif text-lg">Option {index + 1}</span>
            <span className="text-[#D4AF37] text-sm font-bold flex items-center gap-1">
              <Star size={14} className="fill-[#D4AF37]" /> {plan.combinedRating.toFixed(1)} Avg
            </span>
          </div>

          <div className="flex flex-row relative">
            <div className="w-[1px] bg-white/20 absolute left-[35px] top-[90px] bottom-[100px]" />
            <div className="bg-[#09090B] border border-[#D4AF37] w-8 h-8 rounded-full flex items-center justify-center z-10 text-[#D4AF37] shrink-0">
              <Activity size={14} />
            </div>
            <div className="ml-4 mb-4">
              <h3 className="text-md font-medium text-white">{plan.morning.name}</h3>
              <p className="text-sm text-white/70">★ {plan.morning.rating}</p>
            </div>
          </div>

          <div className="ml-[16px] mb-4 flex items-center justify-between gap-2 bg-black/40 w-full max-w-[200px] px-3 py-2 rounded-xl border border-white/5 relative z-10">
            <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
              <Car size={12} /> {plan.totalDistanceKm} km
            </div>
            <button className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-wider hover:text-white transition">
              Add Taxi +$15
            </button>
          </div>

          <div className="flex flex-row relative">
            <div className="bg-[#09090B] border border-[#D4AF37] w-8 h-8 rounded-full flex items-center justify-center z-10 text-[#D4AF37] shrink-0">
              <Utensils size={14} />
            </div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-white">{plan.afternoon.name}</h3>
              <p className="text-sm text-white/70">★ {plan.afternoon.rating}</p>
            </div>
          </div>

          <button className="w-full mt-6 bg-[#D4AF37] text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#C5A059] transition shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <Zap size={16} /> Book Route (Apple Pay)
          </button>
        </div>
      ))}
    </div>
  );
}
