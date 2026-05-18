import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, TrendingUp, Lock, ArrowRight, Star, ShieldCheck } from "lucide-react"
import { siteConfig } from "@/lib/config/site"

interface ClaimPageProps {
  params: Promise<{ businessId: string; lang: string }>
}

export async function generateMetadata({ params }: ClaimPageProps): Promise<Metadata> {
  const { businessId, lang } = await params
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, imageUrl: true }
  })

  if (!business) {
    return { title: 'Claim Profile | Vallecito' }
  }

  const title = `Claim your profile: ${business.name} | Vallecito`
  const description = `Claim ${business.name} on Vallecito to receive direct reservations and leads without commissions.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/claim/${businessId}`,
      languages: {
        en: `${siteConfig.url}/en/claim/${businessId}`,
        es: `${siteConfig.url}/es/claim/${businessId}`,
        'x-default': `${siteConfig.url}/en/claim/${businessId}`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/${lang}/claim/${businessId}`,
      images: [
        {
          url: business.imageUrl || "/images/og-default.jpg",
          width: 1200,
          height: 630,
          alt: business.name,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [business.imageUrl || "/images/og-default.jpg"],
    },
  }
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { businessId } = await params

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    notFound()
  }

  if (business.isClaimed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center space-y-4 bg-white border-slate-200 shadow-xl">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Verified Profile</h2>
          <p className="text-slate-600">This profile has already been claimed and is actively receiving direct bookings.</p>
          <Link href={`/dashboard?businessId=${business.id}`}>
            <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white shadow-md">
              Go to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg shadow-sm flex gap-4 items-start">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-rose-700 font-bold text-lg">Action Required: Waiting Client</h2>
            <p className="text-rose-600/80 text-sm mt-1">An international tourist tried to contact <strong>{business.name}</strong> a few minutes ago, but your profile is listed as &quot;Unverified&quot;.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          <div className="md:col-span-3 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                <ShieldCheck className="w-3 h-3" />
                Business Verification
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Stop losing high-value clients in the Sacred Valley.
              </h1>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                VALLECITO connects international tourists with local experts. Claim your profile for <span className="text-slate-900 font-bold underline decoration-rose-600">FREE</span> to unlock hidden contact details and activate direct WhatsApp booking.
              </p>
            </div>

            <Card className="p-6 border-slate-200 shadow-xl bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                NEW LEAD
              </div>
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-slate-900">
                <Lock className="w-5 h-5 text-slate-400" />
                Pending Client Data
              </h3>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-slate-500">Tourist Name:</span>
                  <span className="font-medium text-slate-900">Sarah J********</span>
                </div>
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-slate-500">Date of Interest:</span>
                  <span className="font-medium text-slate-900">May 15, 2026</span>
                </div>
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-900">{business.category}</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href={`/claim/${business.id}/activate`}>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-6 shadow-md transition-transform hover:scale-[1.02]">
                    Activate Live Profile (Free)
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">100% Free Forever • No Commissions</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Live Preview</h3>
            <Card className="overflow-hidden relative opacity-75 grayscale-[30%] pointer-events-none bg-white border-slate-200">
              <div className="absolute inset-0 bg-white/40 z-10 backdrop-blur-[1px] flex items-center justify-center">
                <Badge variant="secondary" className="bg-slate-900 text-white shadow-lg border-red-500/30 text-xs uppercase tracking-widest font-bold">
                  Unverified
                </Badge>
              </div>

              <div className="relative h-40 w-full">
                <Image
                  src={business.imageUrl || "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop"}
                  alt={business.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-slate-900">
                <h3 className="font-bold text-lg line-clamp-1">{business.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{business.category}</p>
                {business.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-sm">{business.rating}</span>
                    <span className="text-xs text-slate-400">({business.reviewsCount})</span>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4 bg-slate-50 border-slate-200 text-slate-400" disabled>
                  Check Availability
                </Button>
              </div>
            </Card>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Direct Bookings</h4>
                  <p className="text-xs text-slate-600 mt-1">Chat directly with tourists via WhatsApp. No middlemen, no fees.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full shrink-0">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Verified Trust</h4>
                  <p className="text-xs text-slate-600 mt-1">Get the &quot;Verified&quot; badge to rank higher in AI recommendations.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
