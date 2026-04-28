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
      <div className="w-full my-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-sm text-slate-500">No exact matches found for that request in {result.targetLocation}. Try broadening your search or exploring another town.</p>
      </div>
    );
  }

  const isSameTown = result.targetLocation.toLowerCase() === result.userLocation.toLowerCase();

  return (
    <div className="w-full my-6 flex flex-col gap-5">
      <div className="text-slate-500 text-[10px] uppercase font-semibold tracking-widest flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-rose-600" /> {result.targetLocation} Recommendations
        </div>
        {!isSameTown && (
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
            <Car size={10} className="text-slate-400" /> 
            <span className="font-mono text-slate-600">{result.distanceKm}km</span>
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
            className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col relative shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-300 group block"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-rose-600 transition-colors">{exp.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{exp.category}</p>
              </div>
              {exp.rating && (
                <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 shrink-0">
                  <Star size={10} className="fill-rose-500 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900">{exp.rating}</span>
                </div>
              )}
            </div>
          </Link>
          );
        })}
      </div>

      {!isSameTown && (
        <div className="mt-2 bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <div>
              <p className="text-[10px] text-rose-600/80 uppercase tracking-widest font-semibold mb-1">Travel Logistics</p>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-rose-600" />
                <span className="text-sm text-slate-900 font-medium">{result.estimatedTimeMinutes} mins from {result.userLocation}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-rose-600/80 uppercase tracking-widest font-semibold mb-1">Est. Fare</p>
              <span className="text-sm text-slate-900 font-mono">~${result.estimatedTaxiCostUSD} USD</span>
            </div>
          </div>
          
          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-sm z-10">
            Request Transfer <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}