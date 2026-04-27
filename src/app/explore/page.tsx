import { PrismaClient } from "@prisma/client"
import { BusinessCard } from "@/components/cards/business-card"
import { Badge } from "@/components/ui/badge"
import dynamic from 'next/dynamic'
import { AiConcierge } from "@/components/chat/ai-concierge"

const ExploreMap = dynamic(() => import('@/components/map/explore-map'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full bg-slate-100"><p className="text-slate-500">Cargando mapa...</p></div>
})

const prisma = new PrismaClient()

export default async function ExplorePage() {
  const businesses = await prisma.business.findMany()

  const categories = [
    "🥾 Aventura",
    "🧘 Bienestar",
    "🍽️ Gastronomía",
    "🏺 Cultura",
    "🛌 Descanso"
  ]

  return (
    <div className="h-screen w-full flex overflow-hidden bg-gray-50">
      <div className="w-full md:w-[60%] flex flex-col h-full relative">
        <div className="p-6 pb-4 border-b bg-white z-10 sticky top-0 shadow-sm">
          <input 
            type="text" 
            placeholder="✨ Describe tu día ideal en el Valle Sagrado (ej. quiero un masaje y buena comida)..."
            className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all mb-4 text-gray-700 shadow-inner"
          />
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-gray-200 text-sm">
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      </div>

      <div className="w-[40%] hidden md:flex relative bg-slate-200 border-l">
        <ExploreMap businesses={businesses} />
      </div>

      <AiConcierge />
    </div>
  )
}