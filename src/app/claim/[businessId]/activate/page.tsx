import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ActivationFlow } from "@/components/claim/activation-flow"

interface ActivatePageProps {
  params: Promise<{ businessId: string }>
}

export default async function ActivatePage({ params }: ActivatePageProps) {
  const { businessId } = await params
  
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#09090B] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center">
      <ActivationFlow business={{ id: business.id, name: business.name, slug: business.slug }} />
    </div>
  )
}
