"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Zap } from "lucide-react"
import Image from "next/image"
import { generateShadowLead } from "@/features/leads/actions/shadow-lead"

export type Business = {
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
  orientation?: "vertical" | "horizontal"
}

export function BusinessCard({ business, isHighlighted, onSelect, orientation = "vertical" }: BusinessCardProps) {
  const [touristName, setTouristName] = useState("")
  const [date, setDate] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const isHorizontal = orientation === "horizontal"

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!business.whatsapp) return
    const msg = encodeURIComponent(
      `Hello ${business.name}! 👋 I saw your profile on INKAPORTAL and I'd like to make a reservation. When do you have availability?`
    )
    window.open(`https://wa.me/51${business.whatsapp}?text=${msg}`, "_blank")
  }

  const handleConsult = async (e: React.MouseEvent) => {
    e.stopPropagation()
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
    <div
      onClick={onSelect}
      className={`group cursor-pointer transition-all duration-300 ${
        isHighlighted ? "opacity-100 scale-[1.02]" : "opacity-90 hover:opacity-100"
      } ${isHorizontal ? "flex flex-row items-center gap-4" : "flex flex-col gap-3"}`}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isHorizontal ? "w-28 sm:w-40 aspect-square shrink-0" : "w-full aspect-square"
      } ${
        isHighlighted ? "shadow-[0_0_0_3px_#E11D48] shadow-rose-600/50" : "shadow-sm group-hover:shadow-md"
      }`}>
        <Image
          src={displayImage}
          alt={business.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex justify-between items-start z-10 pointer-events-none">
          {business.instagramHandle && !isHorizontal ? (
            <span className="bg-white/90 text-slate-900 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md">
              {business.instagramHandle}
            </span>
          ) : <div />}
          
          {business.isClaimed && (
            <span className="bg-white/90 text-slate-900 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md flex items-center gap-1">
              <Zap className="w-3 h-3 fill-rose-600 text-rose-600" />
              <span className={isHorizontal ? "hidden sm:inline" : ""}>Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className={`flex flex-col ${isHorizontal ? "flex-1 py-1 h-28 sm:h-40 justify-center sm:justify-between" : "gap-1"}`}>
        <div className="flex flex-col gap-1">
          <div className={`flex justify-between gap-2 ${isHorizontal ? "flex-col sm:flex-row sm:items-start" : "items-start"}`}>
            <h3 className={`font-semibold text-slate-900 leading-tight flex-1 ${isHorizontal ? "text-base sm:text-lg line-clamp-2 sm:line-clamp-1" : "text-[15px] line-clamp-1"}`}>
              {business.name}
            </h3>
            {business.rating !== null && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                <span className="font-medium text-sm text-slate-900">{business.rating}</span>
              </div>
            )}
          </div>
          <p className="text-slate-500 text-sm line-clamp-1">
            {business.category} • {business.reviewsCount} reviews
          </p>
        </div>

        <div className={isHorizontal ? "mt-3 sm:mt-auto" : "mt-2"}>
          {business.isClaimed ? (
            <Button
              onClick={handleBookNow}
              className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all ${
                isHorizontal ? "py-2 h-9 text-xs sm:text-sm" : "py-5 text-sm"
              }`}
            >
              Book Now
            </Button>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger render={
                <Button 
                  onClick={(e) => e.stopPropagation()} 
                  variant="outline" 
                  className={`w-full bg-white text-slate-900 border-gray-200 hover:bg-gray-50 hover:text-slate-900 font-semibold rounded-xl transition-all ${
                    isHorizontal ? "py-2 h-9 text-xs sm:text-sm" : "py-5 text-sm"
                  }`}
                >
                  Check Availability
                </Button>
              } />
              <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white border border-gray-200" onClick={(e) => e.stopPropagation()}>
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-serif tracking-tight text-slate-900">Check Availability</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="grid gap-2.5">
                    <Label htmlFor="name" className="text-slate-700 font-medium">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Sarah Jenkins"
                      value={touristName}
                      onChange={(e) => setTouristName(e.target.value)}
                      className="rounded-xl border-gray-200 bg-gray-50 text-slate-900 focus-visible:ring-rose-600 px-4 py-6 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="grid gap-2.5">
                    <Label htmlFor="date" className="text-slate-700 font-medium">Estimated Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-xl border-gray-200 bg-gray-50 text-slate-900 focus-visible:ring-rose-600 px-4 py-6"
                    />
                  </div>
                </div>
                <Button onClick={handleConsult} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-6 rounded-xl font-bold shadow-lg mt-2 transition-transform hover:scale-[1.02]">
                  Send Inquiry
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}
