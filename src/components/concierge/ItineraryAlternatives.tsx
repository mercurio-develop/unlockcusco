"use client";

import { MapPin, Star, Activity, Utensils, Car, Zap } from 'lucide-react';
import { useItinerary } from '@/lib/store/itinerary-context';

type Plan = {
  planId: string;
  combinedRating: number;
  totalDistanceKm: string;
  morning: {
    name: string;
    rating: number;
    lat?: number;
    lng?: number;
    id?: string;
  };
  afternoon: {
    name: string;
    rating: number;
    lat?: number;
    lng?: number;
    id?: string;
  };
};

export default function ItineraryAlternatives({ plans }: { plans: Plan[] }) {
  const { setActiveRelay, setPanelMode } = useItinerary();

  const handleSelectPlan = (plan: Plan) => {
    setActiveRelay({
      origin: "Morning Activity",
      destination: "Afternoon Activity",
      food: { ...plan.morning, distance: "0 km" },
      transit: { name: "Local Transfer", driver: "Pending", rating: 5.0, whatsapp: "" },
      stay: { ...plan.afternoon },
      transitCost: 15,
      foodCost: 0,
      totalCost: 15,
      distanceKm: plan.totalDistanceKm,
    });
    setPanelMode("itinerary");
  };

  return (
    <div className="w-full my-6 flex flex-col gap-5">
      <div className="text-rose-600 text-[10px] uppercase font-semibold tracking-widest flex items-center gap-2 mb-2">
        <MapPin size={12} className="text-rose-600" /> INKAPORTAL Smart Routes
      </div>
      {plans.map((plan, index) => (
        <div
          key={plan.planId}
          className="bg-white border border-gray-200 rounded-3xl p-5 flex flex-col relative shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <span className="text-slate-900 font-medium text-base tracking-wide">Option {index + 1}</span>
            <span className="text-slate-700 text-xs font-semibold flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded-md border border-rose-100">
              <Star size={12} className="fill-rose-500 text-rose-500" /> {plan.combinedRating.toFixed(1)} Avg
            </span>
          </div>

          <div className="flex flex-row relative">
            <div className="w-[1px] bg-gradient-to-b from-gray-200 to-transparent absolute left-[15px] top-[40px] bottom-[-20px]" />
            <div className="bg-gray-50 border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center z-10 text-slate-600 shrink-0">
              <Activity size={14} />
            </div>
            <div className="ml-4 mb-5">
              <h3 className="text-sm font-semibold text-slate-900 leading-tight">{plan.morning.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Star size={10} className="fill-slate-300 text-slate-300"/> {plan.morning.rating}</p>
            </div>
          </div>

          <div className="ml-[12px] mb-5 flex items-center justify-between gap-3 w-full max-w-[240px] pl-8 relative z-10">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
              <Car size={10} /> {plan.totalDistanceKm} km
            </div>
            <button className="text-rose-600 text-[10px] font-medium tracking-wide hover:text-rose-700 transition-colors border-b border-dashed border-rose-300 hover:border-rose-500 pb-0.5">
              Add Transfer
            </button>
          </div>

          <div className="flex flex-row relative mt-2">
            <div className="bg-gray-50 border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center z-10 text-slate-600 shrink-0">
              <Utensils size={14} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-slate-900 leading-tight">{plan.afternoon.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Star size={10} className="fill-slate-300 text-slate-300"/> {plan.afternoon.rating}</p>
            </div>
          </div>

          <button 
            onClick={() => handleSelectPlan(plan)}
            className="w-full mt-7 bg-slate-900 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md text-sm"
          >
            <Zap size={14} /> Lock Itinerary & Show on Map
          </button>
        </div>
      ))}
    </div>
  );
}