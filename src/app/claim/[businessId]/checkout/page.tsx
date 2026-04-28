import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PaymentFlow } from "@/components/checkout/payment-flow"

interface CheckoutPageProps {
  params: Promise<{ businessId: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { businessId } = await params
  
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center">
      <PaymentFlow business={{ id: business.id, name: business.name }} />
    </div>
  )
}
