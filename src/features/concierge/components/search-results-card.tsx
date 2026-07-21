import type { Business } from "@prisma/client";

import { useSelectionStore, useMapUiStore, useConciergeUiStore } from "@/lib/store/use-ui-store";
import { useRouter, usePathname } from "next/navigation";
import { BusinessCard } from "@/features/discovery/components/business-card";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

interface SearchInput {
  query?: string;
  category?: string;
  location?: string;
}

interface FallbackResults {
  alternatives: Business[];
  requestedLocation?: string;
}

type SearchResults = Business[] | FallbackResults;

export function SearchResultsCard({ businesses, input, intent }: { businesses: SearchResults, messageId?: string, input?: SearchInput, intent?: string }) {
  const setSelectedId = useSelectionStore(s => s.setSelectedId);
  const setMobileViewMode = useMapUiStore(s => s.setMobileViewMode);
  const setMapSearchResults = useMapUiStore(s => s.setMapSearchResults);
  const setRadarState = useMapUiStore(s => s.setRadarState);
  const setIsChatOpen = useConciergeUiStore(s => s.setIsChatOpen);
  const router = useRouter();
  const pathname = usePathname();

  const isFallback = !Array.isArray(businesses) && 'alternatives' in businesses;
  const list = Array.isArray(businesses) ? businesses : (businesses.alternatives || []);
  const requestedLocation = !Array.isArray(businesses) ? businesses.requestedLocation : null;

  const locale = pathname?.split('/')[1] || 'en';
  const fallbackTitle = locale === 'es' ? "Alojamientos Cercanos" : "Nearby Stays";

  let dynamicTitle = "Top Recommendations";
  if (intent === 'SET_START') {
    dynamicTitle = `Select Start Point: ${input?.query || input?.category || 'Options'}`;
  } else if (intent === 'SET_END') {
    dynamicTitle = `Select End Point: ${input?.query || input?.category || 'Options'}`;
  } else if (input?.query && !input.category) {
    dynamicTitle = `Search Results for "${input.query}"`;
  } else if (input) {
    const noun = input.category || input.query || "Recommendations";
    const loc = input.location ? ` in ${input.location}` : "";
    dynamicTitle = `Top ${noun}${loc}`;
  }

  if (!list || list.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-500">No matching places found.</p>
      </div>
    );
  }

  const handleSelect = (business: Business) => {
    // Cast to any for dynamic property checks if not in Prisma model
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = business as any;
    setIsChatOpen(false); // Close chat to view the page
    if (business.category === 'Taxi' || b.type === 'TRANSPORT') {
      router.push('/services/transport');
    } else if (business.category === 'Business' || b.type === 'AGENCY') {
      router.push('/services/agencies');
    } else if (['Business', 'Guide', 'Therapy', 'Wellness'].includes(business.category || '') || b.type === 'THERAPIST') {
      router.push('/services/healers');
    } else {
      setSelectedId(business.id);
      if (pathname && !pathname.includes('/explore')) {
        const locale = pathname.split('/')[1] || 'en';
        const langPrefix = ['en', 'es'].includes(locale) ? `/${locale}` : '/en';
        router.push(`${langPrefix}/explore`);
      }
    }
  };

  const handleShowInMap = () => {
    setRadarState(null);
    setSelectedId(null);
    setMapSearchResults(list as Business[]);
    setMobileViewMode('map');
    setIsChatOpen(false); // Close chat overlay to see the map
    
    if (pathname && !pathname.includes('/explore')) {
      const locale = pathname.split('/')[1] || 'en';
      const langPrefix = ['en', 'es'].includes(locale) ? `/${locale}` : '/en';
      router.push(`${langPrefix}/explore`);
    }
  };

  return (
    <div className="my-3 -mx-4 sm:mx-0">
      <div className="flex items-center justify-between mb-2 px-4 sm:px-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            {isFallback ? fallbackTitle : dynamicTitle}
          </span>
          {isFallback && requestedLocation && (
            <span className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">
              None found in {requestedLocation}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mr-2 sm:mr-0">{list.length} found</span>
      </div>

      <div className="flex overflow-x-auto items-stretch gap-4 pb-4 px-4 sm:px-0 snap-x snap-mandatory scrollbar-hide">
        {list.map((business, idx: number) => (
          <div key={business.id ?? idx} className="w-[280px] shrink-0 snap-start flex flex-col">
            <BusinessCard
              business={business}
              orientation="vertical"
              onSelect={() => handleSelect(business)}
              showMap={true}
              showContact={false}
              intent={intent}
            />
          </div>
        ))}
      </div>
      
      <div className="px-4 sm:px-0 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center gap-2 text-xs h-9 bg-white shadow-sm border-slate-200"
          onClick={handleShowInMap}
        >
          <Map className="w-4 h-4 text-emerald-600" />
          Show in Map
        </Button>
      </div>
    </div>
  );
}
