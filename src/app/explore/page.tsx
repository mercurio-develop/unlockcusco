import { ExploreView } from "@/components/explore/explore-view"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"

interface ExplorePageProps {
  searchParams: Promise<{ q?: string; id?: string; loc?: string; cat?: string }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q, id, loc, cat } = await searchParams
  const query = q?.toLowerCase() || ""

  const { businesses, hasMore } = await fetchBusinesses({
    query,
    category: cat,
    loc,
    page: 0,
    limit: 20
  })

  // Ensure selected business is exactly at the top
  if (id) {
    const selectedIndex = businesses.findIndex(b => b.id === id)
    if (selectedIndex > 0) {
      const [selectedBusiness] = businesses.splice(selectedIndex, 1)
      businesses.unshift(selectedBusiness)
    } else if (selectedIndex === -1) {
      // It's not in the first 20 items, so we'll need to fetch it dynamically
      // or we can let the client handle it.
      // For MVP, we'll let the client handle the initialSelectedId finding 
      // but ideally we would fetch this record and prepend it here.
    }
  }

  return (
    <div className="relative">
      <ExploreView 
        initialBusinesses={businesses} 
        initialHasMore={hasMore}
        initialQuery={q ?? ""} 
        initialSelectedId={id ?? null} 
      />
    </div>
  )
}

