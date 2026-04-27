import { PrismaClient } from "@prisma/client"
import { BusinessCard } from "@/components/cards/business-card"
import { Badge } from "@/components/ui/badge"
import { ExploreMapWrapper as ExploreMap } from "@/components/map/explore-map-wrapper"
import { AiConcierge } from "@/components/chat/ai-concierge"

const prisma = new PrismaClient()

interface ExplorePageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q } = await searchParams;
  let businesses = await prisma.business.findMany()

  if (q) {
    const query = q.toLowerCase();
    let targetCategory = "";
    if (query.includes("massage") || query.includes("spa") || query.includes("bienestar") || query.includes("recovery")) targetCategory = "Bienestar";
    else if (query.includes("atv") || query.includes("hiking") || query.includes("aventura") || query.includes("tour") || query.includes("trail")) targetCategory = "Aventura";
    else if (query.includes("picantería") || query.includes("restaurant") || query.includes("food") || query.includes("gastronomía") || query.includes("eat")) targetCategory = "Gastronomía";
    else if (query.includes("hotel") || query.includes("descanso") || query.includes("sleep")) targetCategory = "Descanso";
    else if (query.includes("market") || query.includes("cultura") || query.includes("art")) targetCategory = "Cultura";

    if (targetCategory) {
      businesses = businesses.filter(b => b.category === targetCategory);
    } else {
      businesses = businesses.filter(b => 
        b.name.toLowerCase().includes(query) || 
        b.category.toLowerCase().includes(query)
      );
    }
  }

  const categories = [
    "🥾 Aventura",
    "🧘 Bienestar",
    "🍽️ Gastronomía",
    "🏺 Cultura",
    "🛌 Descanso"
  ]

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#FAFAFA] font-sans">
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col h-full relative border-r border-slate-200">
        
        <div className="px-8 pt-8 pb-4 bg-white/80 backdrop-blur-xl z-10 sticky top-0 border-b border-slate-100">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">
            Explore the Valley
          </h1>
          
          <input 
            type="text" 
            defaultValue={q || ""}
            placeholder="✨ Describe your perfect day (e.g. massage and good food)..."
            className="w-full p-5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all mb-6 text-slate-800 shadow-sm text-lg placeholder:text-slate-400 font-light"
          />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const categoryName = cat.split(" ")[1];
              const isActive = q && q.toLowerCase().includes(categoryName.toLowerCase());
              return (
                <Badge 
                  key={cat} 
                  variant="secondary" 
                  className={`px-5 py-2.5 rounded-full whitespace-nowrap cursor-pointer transition-colors text-sm font-medium ${isActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
          {businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <p className="text-xl font-light">No places found for this search.</p>
              <p className="text-sm">Try searching for "massage", "ATV", or "restaurant".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[45%] lg:w-[40%] hidden md:block relative bg-slate-200">
        <ExploreMap businesses={businesses} />
      </div>

      <AiConcierge />
    </div>
  )
}
