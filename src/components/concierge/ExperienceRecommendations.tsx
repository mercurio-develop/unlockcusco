"use client";

import { MapPin, Star, Clock, Car, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ExperienceResult = {
  targetLocation: string;
  userLocation: string;
  distanceKm: string;
  estimatedTimeMinutes: number;
  estimatedTaxiCostUSD: number;
  experiences: Record<string, unknown>[];
};

export default function ExperienceRecommendations({ result }: { result: ExperienceResult }) {
  if (!result.experiences || result.experiences.length === 0) {
    return (
      <div className="w-full my-4 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-sm text-white/70">No exact matches found for that request in {result.targetLocation}. Try broadening your search or exploring another town.</p>
      </div>
    );
  }

  const isSameTown = result.targetLocation.toLowerCase() === result.userLocation.toLowerCase();

  return (
    <div className="w-full my-6 flex flex-col gap-5">
      <div className="text-white/50 text-[10px] uppercase font-semibold tracking-widest flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-[#D4AF37]" /> {result.targetLocation} Recommendations
        </div>
        {!isSameTown && (
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <Car size={10} className="text-white/40" /> 
            <span className="font-mono">{result.distanceKm}km</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {result.experiences.map((expRecord) => {
          const exp = expRecord as { id: string; slug: string; name: string; category: string; rating: number | null };
          return (
          <Link
            key={exp.id}
            href={`/business/${exp.slug}`}
            className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col relative backdrop-blur-xl shadow-lg hover:border-white/20 transition-all duration-300 group block"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white/90 leading-tight group-hover:text-[#D4AF37] transition-colors">{exp.name}</h3>
                <p className="text-xs text-white/40 mt-1">{exp.category}</p>
              </div>
              {exp.rating && (
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/10 shrink-0">
                  <Star size={10} className="fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-xs font-bold text-white">{exp.rating}</span>
                </div>
              )}
            </div>
          </Link>
          );
        })}
      </div>

      {!isSameTown && (
        <div className="mt-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between z-10">
            <div>
              <p className="text-[10px] text-[#D4AF37]/70 uppercase tracking-widest font-semibold mb-1">Travel Logistics</p>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-[#D4AF37]" />
                <span className="text-sm text-white font-medium">{result.estimatedTimeMinutes} mins from {result.userLocation}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#D4AF37]/70 uppercase tracking-widest font-semibold mb-1">Est. Fare</p>
              <span className="text-sm text-white font-mono">~${result.estimatedTaxiCostUSD} USD</span>
            </div>
          </div>
          
          <button className="w-full bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] text-sm z-10">
            Request Transfer <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}