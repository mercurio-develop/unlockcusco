"use client";

import { Business } from "@prisma/client";

import { useItinerary } from "@/lib/store/itinerary-context";
import { Plus, Star, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchResultsCard({ businesses }: { businesses: Business[] }) {
  const { activeItinerary, insertWaypoint, setSelectedId, panelMode, currentTrip } = useItinerary();
  const router = useRouter();

  const isFallback = !Array.isArray(businesses) && (businesses as any)?.alternatives;
  const list = Array.isArray(businesses) ? businesses : ((businesses as any)?.alternatives || []);
  const requestedLocation = !Array.isArray(businesses) ? (businesses as any)?.requestedLocation : null;

  if (!list || !Array.isArray(list) || list.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-500">No matching places found.</p>
      </div>
    );
  }

  const handleSelect = (business: Business) => {
    if (business.category === 'Taxi' || (business as any).type === 'TRANSPORT') {
      router.push('/services/transport');
    } else if (business.category === 'Business' || (business as any).type === 'AGENCY') {
      router.push('/services/agencies');
    } else if (['Business', 'Guide', 'Therapy', 'Wellness'].includes(business.category) || (business as any).type === 'THERAPIST') {
      router.push('/services/healers');
    } else {
      router.push(`/explore?id=${business.id}`);
      setSelectedId(business.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full my-3">
      <div className="bg-slate-50 border-b border-gray-100 px-3 py-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            {isFallback ? "Nearby Alternatives" : "Top Recommendations"}
          </span>
          {isFallback && requestedLocation && (
            <span className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">
              None found in {requestedLocation}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400">{list.length} found</span>
      </div>
      
      <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
        {list.map((business: Business, idx: number) => {
          const displayImage = business.imageUrl;
          const showAdd = activeItinerary || (panelMode === 'builder' && currentTrip);
          
          return (
            <div 
              key={business.id ?? idx} 
              onClick={() => handleSelect(business)}
              className="p-3 flex gap-3 hover:bg-gray-50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0 relative">
                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={business.name} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop";
                      e.currentTarget.onerror = null;
                    }}
                  />
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
                      <span className="text-[10px] font-bold">{(Number(business.rating)).toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {business.category} in {(business as any).locationLabel || 'Vallecito'}
                  </p>
                  
                  {showAdd && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        insertWaypoint(business);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 inline-block mr-0.5" /> Add
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
