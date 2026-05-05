import { Business, Transport, Therapist, Agency, TourPackage } from "@prisma/client"
import type { UniversalService, EntityType } from "@/lib/types/trip"

export function mapBusinessToUniversal(b: Business): UniversalService {
  return {
    id: b.id,
    slug: b.slug,
    type: 'BUSINESS',
    name: b.name,
    description: b.reviewSummary || \"\",
    imageUrl: b.imageUrl,
    rating: b.rating || undefined,
    reviewsCount: b.reviewsCount,
    whatsapp: b.whatsapp || undefined,
    lat: b.lat || undefined,
    lng: b.lng || undefined,
    locationLabel: b.locationSlug || \"Sacred Valley\",
    category: b.category,
    priceTier: b.priceTier,
    metadata: {
      isClaimed: b.isClaimed,
    },
    _raw: { business: b }
  }
}

export function mapTransportToUniversal(t: Transport): UniversalService {
  return {
    id: t.id,
    slug: t.slug,
    type: 'TRANSPORT',
    name: t.name,
    description: \`\${t.vehicleType} transport. Capacity: \${t.capacity} pax.\`,
    imageUrl: t.imageUrl || \"\",
    rating: t.rating || undefined,
    reviewsCount: t.reviewsCount,
    whatsapp: t.whatsapp || undefined,
    locationLabel: \"Sacred Valley\",
    category: t.category || 'Taxi',
    basePriceUsd: t.basePriceUsd || undefined,
    metadata: {
      capacity: t.capacity,
      vehicleType: t.vehicleType,
    },
    _raw: { transport: t }
  }
}

export function mapTherapistToUniversal(t: Therapist): UniversalService {
    return {
      id: t.id,
      slug: t.slug,
      type: 'THERAPIST',
      name: t.name,
      description: t.bio,
      tagline: t.tagline,
      imageUrl: t.imageUrl,
      rating: t.rating || undefined,
      reviewsCount: t.reviewsCount,
      whatsapp: t.whatsapp,
      locationLabel: t.location,
      category: 'Wellness',
      metadata: {
        specialties: JSON.parse(t.specialties || \"[]\"),
      },
      _raw: { therapist: t }
    }
}
