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
    <div className="w-full my-6 flex flex-col gap-5">
      <div className="text-white/50 text-[10px] uppercase font-semibold tracking-widest flex items-center gap-2 mb-2">
        <MapPin size={12} className="text-[#D4AF37]" /> INKAPORTAL Smart Routes
      </div>
      {plans.map((plan, index) => (
        <div
          key={plan.planId}
          className="bg-black/40 border border-white/10 rounded-3xl p-5 flex flex-col relative backdrop-blur-xl shadow-lg hover:border-white/20 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <span className="text-white font-medium text-base tracking-wide">Option {index + 1}</span>
            <span className="text-white/80 text-xs font-semibold flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
              <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" /> {plan.combinedRating.toFixed(1)} Avg
            </span>
          </div>

          <div className="flex flex-row relative">
            <div className="w-[1px] bg-gradient-to-b from-white/20 to-white/5 absolute left-[15px] top-[40px] bottom-[-20px]" />
            <div className="bg-[#09090B] border border-white/10 w-8 h-8 rounded-full flex items-center justify-center z-10 text-white/70 shrink-0 shadow-inner">
              <Activity size={14} />
            </div>
            <div className="ml-4 mb-5">
              <h3 className="text-sm font-semibold text-white/90 leading-tight">{plan.morning.name}</h3>
              <p className="text-xs text-white/40 mt-1 flex items-center gap-1"><Star size={10} className="fill-white/30 text-white/30"/> {plan.morning.rating}</p>
            </div>
          </div>

          <div className="ml-[12px] mb-5 flex items-center justify-between gap-3 w-full max-w-[240px] pl-8 relative z-10">
            <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <Car size={10} /> {plan.totalDistanceKm} km
            </div>
            <button className="text-white/50 text-[10px] font-medium tracking-wide hover:text-white transition-colors border-b border-dashed border-white/20 hover:border-white/60 pb-0.5">
              Add Transfer
            </button>
          </div>

          <div className="flex flex-row relative mt-2">
            <div className="bg-[#09090B] border border-white/10 w-8 h-8 rounded-full flex items-center justify-center z-10 text-white/70 shrink-0 shadow-inner">
              <Utensils size={14} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-white/90 leading-tight">{plan.afternoon.name}</h3>
              <p className="text-xs text-white/40 mt-1 flex items-center gap-1"><Star size={10} className="fill-white/30 text-white/30"/> {plan.afternoon.rating}</p>
            </div>
          </div>

          <button className="w-full mt-7 bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] text-sm">
            <Zap size={14} /> Book via Apple Pay
          </button>
        </div>
      ))}
    </div>
  );
}
