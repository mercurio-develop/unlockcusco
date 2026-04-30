"use client";

import { useItinerary } from "@/lib/store/itinerary-context";
import { Plus, Star, MapPin } from "lucide-react";
import Image from "next/image";

export function SearchResultsCard({ businesses }: { businesses: any[] }) {
  const { activeItinerary, insertWaypoint } = useItinerary();

  if (!businesses || businesses.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-500">No matching places found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full my-3">
      <div className="bg-slate-50 border-b border-gray-100 px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Top Recommendations</span>
        <span className="text-[10px] text-slate-400">{businesses.length} found</span>
      </div>
      
      <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
        {businesses.map((business, idx) => {
          const parsedHeroImages = business.heroImages && business.heroImages !== "[]" ? JSON.parse(business.heroImages) : [];
          const displayImage = parsedHeroImages.length > 0 ? parsedHeroImages[0] : business.imageUrl;
          
          return (
            <div key={business.id ?? idx} className="p-3 flex gap-3 hover:bg-gray-50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0 relative">
                {displayImage ? (
                  <Image src={displayImage} alt={business.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{business.name}</h4>
                  {business.rating && (
                    <div className="flex items-center gap-0.5 shrink-0 bg-rose-50 px-1.5 py-0.5 rounded text-rose-700">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span className="text-[10px] font-bold">{business.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {business.category} in {business.locationSlug ? (business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1)) : 'Vallecito'}
                  </p>
                  
                  {activeItinerary && business.businessType !== 'service' && (
                    <button
                      onClick={() => insertWaypoint(business)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-all"
                    >
                      <Plus className="w-3 h-3 inline-block mr-0.5" /> Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}