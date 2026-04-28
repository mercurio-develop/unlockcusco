"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Zap, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { generateShadowLead } from "@/features/leads/actions/shadow-lead"

type Business = {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  rating: number | null
  reviewsCount: number
  imageUrl: string
  whatsapp: string | null
  isClaimed: boolean
  instagramHandle?: string | null
  instagramFollowers?: number
  heroImages?: string | null
}

interface BusinessCardProps {
  business: Business
  isHighlighted?: boolean
  onSelect?: () => void
}

export function BusinessCard({ business, isHighlighted, onSelect }: BusinessCardProps) {
  const [touristName, setTouristName] = useState("")
  const [date, setDate] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleBookNow = () => {
    if (!business.whatsapp) return
    const msg = encodeURIComponent(
      `Hello ${business.name}! 👋 I saw your profile on INKAPORTAL and I'd like to make a reservation. When do you have availability?`
    )
    window.open(`https://wa.me/51${business.whatsapp}?text=${msg}`, "_blank")
  }

  const handleConsult = async () => {
    if (!touristName || !date) return

    try {
      const res = await generateShadowLead(business.id, touristName, date)
      if (res.success) {
        window.open(res.url, "_blank")
        setIsOpen(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const parsedHeroImages = business.heroImages && business.heroImages !== "[]" ? JSON.parse(business.heroImages) : []
  const displayImage = parsedHeroImages.length > 0 ? parsedHeroImages[0] : business.imageUrl

  return (
    <Card
      onClick={onSelect}
      className={`overflow-hidden relative flex flex-col rounded-3xl shadow-xl transition-all duration-300 group bg-white/5 backdrop-blur-md cursor-pointer ${
        isHighlighted
          ? "border-[#D4AF37]/80 shadow-[0_0_24px_-4px_rgba(212,175,55,0.4)] scale-[1.01]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="relative overflow-hidden h-36 md:h-48 w-full">
        <Image
          src={displayImage}
          alt={business.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        {business.isClaimed && (
          <Badge className="absolute top-4 right-4 bg-[#25D366] hover:bg-green-500 text-white font-bold border-none shadow-lg flex items-center gap-1.5 px-3 py-1.5 z-10 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 fill-current" />
            Instant Booking
          </Badge>
        )}
        {business.instagramHandle && (
           <Badge className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white font-bold border-white/20 shadow-lg flex items-center gap-1.5 px-3 py-1.5 z-10 backdrop-blur-md">
            {business.instagramHandle}
          </Badge>
        )}
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-1 relative z-10">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg md:text-xl font-serif tracking-tight line-clamp-1 text-white group-hover:text-[#D4AF37] transition-colors flex-1">{business.name}</h3>
            {business.rating !== null && (
              <div className="flex items-center gap-1 bg-black/40 px-1.5 py-1 rounded-lg border border-white/10 shrink-0 backdrop-blur-sm">
                <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
                <span className="font-bold text-xs text-white">{business.rating}</span>
                <span className="text-[10px] text-white/50 font-medium">({business.reviewsCount})</span>
              </div>
            )}
          </div>
          <div>
            <Badge variant="secondary" className="text-white/70 bg-white/5 border border-white/10 font-medium px-2.5 py-0.5 text-[10px] md:text-xs">
              {business.category}
            </Badge>
          </div>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex flex-col gap-2 mb-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors w-fit"
            >
              <MapPin className="w-3 h-3" /> View on Map
            </a>
            
            <Link 
              href={`/business/${business.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#D4AF37] text-xs font-semibold hover:text-[#C5A059] transition-colors inline-block"
            >
              View Profile & Reviews →
            </Link>
          </div>

          {business.isClaimed ? (
            <Button
              onClick={handleBookNow}
              className="w-full bg-[#25D366] hover:bg-green-600 text-white text-sm font-semibold py-4 md:py-5 rounded-xl shadow-md shadow-green-500/20 transition-all hover:-translate-y-0.5"
            >
              Book Now
            </Button>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger render={
                <Button variant="outline" className="w-full text-white bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-sm font-semibold py-4 md:py-5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm backdrop-blur-sm">
                  Check Availability
                </Button>
              } />
              <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-[#09090B] border border-white/20">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-serif tracking-tight text-white">Check Availability</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="grid gap-2.5">
                    <Label htmlFor="name" className="text-white/70 font-medium">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Sarah Jenkins"
                      value={touristName}
                      onChange={(e) => setTouristName(e.target.value)}
                      className="rounded-xl border-white/20 bg-white/5 text-white focus-visible:ring-[#D4AF37] px-4 py-6 placeholder:text-white/30"
                    />
                  </div>
                  <div className="grid gap-2.5">
                    <Label htmlFor="date" className="text-white/70 font-medium">Estimated Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-xl border-white/20 bg-white/5 text-white focus-visible:ring-[#D4AF37] px-4 py-6"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
                <Button onClick={handleConsult} className="w-full bg-[#D4AF37] hover:bg-[#C5A059] text-black py-6 rounded-xl font-bold shadow-lg mt-2 transition-transform hover:scale-[1.02]">
                  Send Inquiry
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  )
}