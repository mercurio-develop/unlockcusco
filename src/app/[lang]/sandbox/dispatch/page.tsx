import { prisma } from "@/lib/prisma"
import { SandboxDashboard } from "@/features/sandbox"

export const dynamic = "force-dynamic"

export default async function DispatchSandboxPage() {
  const [rides, businesses] = await Promise.all([
    prisma.rideBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        driver: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    }),
    prisma.business.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        locationSlug: true,
        slug: true,
        affiliateLinks: true
      }
    })
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <SandboxDashboard rides={rides} businesses={businesses} />
    </div>
  )
}

