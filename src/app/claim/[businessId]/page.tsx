import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, TrendingUp, Lock, ArrowRight, Star } from "lucide-react"

interface ClaimPageProps {
  params: Promise<{ businessId: string }>
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { businessId } = await params
  
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    notFound()
  }

  // Redirect if already claimed
  if (business.isClaimed) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center space-y-4 bg-white/5 border-white/10 backdrop-blur-md">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Verified Profile</h2>
          <p className="text-white/60">This profile has already been claimed and is actively receiving direct bookings.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090B] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Urgent Header */}
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex gap-4 items-start">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-red-400 font-bold text-lg">Action Required: Waiting Client</h2>
            <p className="text-red-300/80 text-sm mt-1">An international tourist tried to contact <strong>{business.name}</strong> a few minutes ago, but your profile is listed as &quot;Unverified&quot;.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Main Value Prop */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Don&apos;t lose any more clients in the Sacred Valley with VALLECITO.
              </h1>
              <p className="mt-4 text-lg text-white/60 leading-relaxed">
                VALLECITO is the AI-powered directory tourists use to plan their trips. Claim your profile now to unlock client contacts and activate the &quot;Instant Booking&quot; button.
              </p>
            </div>

            <Card className="p-6 border-white/10 shadow-lg bg-white/5 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 bg-[#D4AF37] text-black px-4 py-1 text-xs font-bold rounded-bl-lg">
                NEW LEAD
              </div>
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-white">
                <Lock className="w-5 h-5 text-white/40" />
                Hidden Booking Details
              </h3>
              
              <div className="space-y-3 bg-black/40 p-4 rounded-lg border border-white/5">
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-white/50">Tourist Name:</span>
                  <span className="font-medium text-white/90">Sarah J********</span>
                </div>
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-white/50">Date of Interest:</span>
                  <span className="font-medium text-white/90">May 15, 2026</span>
                </div>
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-white/50">Category:</span>
                  <span className="font-medium text-white/90">{business.category}</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href={`/claim/${business.id}/activate`}>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#C5A059] text-black font-bold text-lg py-6 shadow-xl transition-transform hover:scale-[1.02]">
                    Claim Profile for Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-xs text-white/40 mt-3">100% free. Just upload your Yape QR code.</p>
              </div>
            </Card>
          </div>

          {/* Business Preview Sidebar */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">How tourists see you today</h3>
            <Card className="overflow-hidden relative opacity-75 grayscale-[30%] pointer-events-none bg-white/5 border-white/10">
              <div className="absolute inset-0 bg-black/20 z-10 backdrop-blur-[1px] flex items-center justify-center">
                <Badge variant="secondary" className="bg-[#09090B] text-white/90 shadow-lg border-red-500/30 text-xs uppercase tracking-widest font-bold">
                  Unverified
                </Badge>
              </div>
              
              <div className="relative h-40 w-full">
                <Image
                  src={business.imageUrl}
                  alt={business.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-white">
                <h3 className="font-bold text-lg line-clamp-1">{business.name}</h3>
                <p className="text-sm text-white/50 mt-1">{business.category}</p>
                {business.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                    <span className="font-semibold text-sm">{business.rating}</span>
                    <span className="text-xs text-white/40">({business.reviewsCount})</span>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4 bg-white/5 border-white/10 text-white/50" disabled>
                  Check Availability
                </Button>
              </div>
            </Card>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#25D366]/20 p-2 rounded-full shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Increase Your Sales</h4>
                  <p className="text-xs text-white/60 mt-1">Connect directly via WhatsApp with high-value tourists. No booking commissions.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}