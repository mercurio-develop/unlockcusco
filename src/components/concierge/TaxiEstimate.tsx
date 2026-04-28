"use client";

import { Car, MapPinOff, ArrowRight } from 'lucide-react';

type TaxiResult = {
  destinationName?: string;
  originGuessed?: string;
  distanceKm?: string;
  estimatedCostUSD?: number;
  estimatedTimeMinutes?: number;
  error?: string;
  taxi?: {
    name: string;
    whatsapp: string;
  };
};

export default function TaxiEstimate({ result }: { result: TaxiResult }) {
  if (result.error) {
    return (
      <div className="w-full my-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-2">
        <div className="text-red-400 text-xs font-semibold flex items-center gap-1.5">
          <MapPinOff size={14} /> Location Not Found
        </div>
        <p className="text-sm text-red-200/80 leading-relaxed">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="w-full my-4 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col relative backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <div className="bg-[#D4AF37]/20 p-1.5 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37]">
          <Car size={14} />
        </div>
        <h4 className="text-sm font-semibold text-white/90">InkaPortal Transfer</h4>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent mx-auto my-1" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Pick up</p>
            <p className="text-sm text-white/90 font-medium mt-0.5">{result.originGuessed}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1">
            <div className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Drop off</p>
            <p className="text-sm text-[#D4AF37] font-semibold mt-0.5">{result.destinationName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-black/30 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Time & Distance</p>
          <p className="text-sm text-white/90 font-mono">{result.estimatedTimeMinutes} min <span className="text-white/30 mx-1">•</span> {result.distanceKm} km</p>
        </div>
        <div className="bg-black/30 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Estimated Fare</p>
          <p className="text-sm text-white/90 font-mono">~${result.estimatedCostUSD} USD</p>
        </div>
      </div>

      {result.taxi ? (
        <button className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] text-sm">
          Pay ${result.estimatedCostUSD} with Apple Pay <ArrowRight size={14} />
        </button>
      ) : (
        <button className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] text-sm opacity-50 cursor-not-allowed">
          No Taxis Available <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
