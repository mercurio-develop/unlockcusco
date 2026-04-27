"use client"

import dynamic from 'next/dynamic'

type Business = {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  rating: number | null
  reviewsCount: number
  imageUrl: string
  isClaimed: boolean
}

interface ExploreMapProps {
  businesses: Business[]
}

const DynamicMap = dynamic(() => import('./explore-map'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-slate-100">
      <p className="text-slate-500">Cargando mapa...</p>
    </div>
  )
})

export function ExploreMapWrapper({ businesses }: ExploreMapProps) {
  return <DynamicMap businesses={businesses} />
}