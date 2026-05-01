import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const paceMap: Record<string, string[]> = {
  OBSERVER: ['SLOW'],
  EXPLORER: ['SLOW', 'BALANCED'],
  EXPEDITIONIST: ['BALANCED', 'FAST'],
}

const lensTagMap: Record<string, string[]> = {
  HISTORIAN: ['ruins', 'inca', 'historical', 'archaeology', 'ancestral', 'citadel'],
  CULTURE: ['culture', 'textiles', 'market', 'community', 'weaving', 'living'],
  EPICUREAN: ['food', 'organic', 'tasting', 'pachamanca', 'local'],
  SANCTUARY: ['wellness', 'spiritual', 'healing', 'thermal', 'restorative', 'sound'],
}

export async function GET(req: NextRequest) {
  try {
    const exertion = req.nextUrl.searchParams.get('exertion') || 'EXPLORER'
    const lensParam = req.nextUrl.searchParams.get('lenses') || ''
    const lenses = lensParam ? lensParam.split(',').filter(Boolean) : []

    const allowedPaces = paceMap[exertion] || ['SLOW', 'BALANCED', 'FAST']

    const WIZARD_SECTORS = ['EAST_VALLEY', 'URUBAMBA', 'CUSCO_CITY', 'OTHER']

    const packages = await prisma.tourPackage.findMany({
      where: {
        pace: { in: allowedPaces },
        sector: { in: WIZARD_SECTORS },
      },
      select: { 
        id: true, 
        title: true, 
        sector: true, 
        pace: true, 
        basePriceUsd: true, 
        tags: true, 
        description: true,
        heroImage: true,
        galleryJson: true,
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true
          }
        }
      },
      orderBy: { basePriceUsd: 'asc' },
    })

    const lensTags = lenses.flatMap(l => lensTagMap[l] || [])

    const scored = packages
      .map(pkg => {
        const tagStr = pkg.tags || ''
        const tagList = tagStr.toLowerCase().split(/[,\s]+/)
        const score = lensTags.filter(t => tagList.some(tag => tag.includes(t))).length
        return { ...pkg, _score: score }
      })
      .sort((a, b) => b._score - a._score)

    return Response.json(scored)
  } catch (error) {
    console.error("Error in /api/packages:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
