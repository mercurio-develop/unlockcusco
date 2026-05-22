"use client";

import type { Business } from "@prisma/client";

import { useUiStore } from "@/lib/store/use-ui-store";
import { useRouter } from "next/navigation";
import { BusinessCard } from "@/features/discovery/components/business-card";

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
  const setSelectedId = useUiStore(s => s.setSelectedId);
  const router = useRouter();

  const isFallback = !Array.isArray(businesses) && 'alternatives' in businesses;
  const list = Array.isArray(businesses) ? businesses : (businesses.alternatives || []);
  const requestedLocation = !Array.isArray(businesses) ? businesses.requestedLocation : null;

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
    if (business.category === 'Taxi' || b.type === 'TRANSPORT') {
      router.push('/services/transport');
    } else if (business.category === 'Business' || b.type === 'AGENCY') {
      router.push('/services/agencies');
    } else if (['Business', 'Guide', 'Therapy', 'Wellness'].includes(business.category || '') || b.type === 'THERAPIST') {
      router.push('/services/healers');
    } else {
      setSelectedId(business.id);
    }
  };

  return (
    <div className="my-3 -mx-4 sm:mx-0">
      <div className="flex items-center justify-between mb-2 px-4 sm:px-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            {isFallback ? "Nearby Alternatives" : dynamicTitle}
          </span>
          {isFallback && requestedLocation && (
            <span className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">
              None found in {requestedLocation}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mr-2 sm:mr-0">{list.length} found</span>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 px-4 sm:px-0 snap-x snap-mandatory scrollbar-hide">
        {list.map((business, idx: number) => (
          <div key={business.id ?? idx} className="w-[280px] shrink-0 snap-start">
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
    </div>
  );
}
