import { prisma } from "@/lib/prisma"
import { SandboxDashboard } from "@/features/sandbox"

export const dynamic = "force-dynamic"

export default async function DispatchSandboxPage() {
  const rides = await prisma.rideBooking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      driver: true,
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <SandboxDashboard rides={rides} />
    </div>
  )
}
