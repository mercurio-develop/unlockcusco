"use client"

import { useState } from "react"
import Link from "next/link"
import { agencyPath, therapistPath } from "@/paths"
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
import { Star, Zap, Plus, Phone, Users, MapPin, Briefcase } from "lucide-react"
import { trackWhatsappClick } from "@/features/business/actions/track-click"
import { trackBusinessView } from "@/features/business/actions/track-view"
import { submitLead } from "@/features/leads/actions/submit-lead"
import { generateShadowLead } from "@/features/leads/actions/shadow-lead"
import { useTrip } from "@/lib/store/trip-context"
import { cn } from "@/lib/utils"
import type { Business } from "@prisma/client"

interface BusinessCardProps {
  business: Business
  isHighlighted?: boolean
  onSelect?: () => void
  orientation?: "vertical" | "horizontal"
  showAddButton?: boolean
}

export function BusinessCard({ 
  business, 
  isHighlighted, 
  onSelect, 
  orientation = "vertical",
  showAddButton = true
}: BusinessCardProps) {
  const [touristName, setTouristName] = useState("")
  const [date, setDate] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { activeItinerary, insertWaypoint, panelMode } = useTrip()
  
  const isHorizontal = orientation === "horizontal"
  const isClaimed = business.isClaimed || false
  const hasProfile = (business.category === 'AGENCY' || business.category === 'WELLNESS') && !!business.tagline

  const handleBookNow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!business.whatsapp) return
    await trackWhatsappClick(business.id)
    const msg = encodeURIComponent(
      `Hello ${business.name}! 👋 I saw your profile on VALLECITO and I'd like to make a reservation. When do you have availability?`
    )
    window.open(`https://wa.me/51${business.whatsapp.replace(/\\D/g, '')}?text=${msg}`, "_blank")
  }

  const handleConsult = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!touristName || !date) return

    try {
      const res = await generateShadowLead(business.id, touristName, date)
      await submitLead({
        businessId: business.id,
        touristName,
        touristEmail: "tourist@example.com",
        date: new Date(date),
      })
      if (res.success) {
        window.open(res.url, "_blank")
        setIsOpen(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect()
      trackBusinessView(business.id)
    }
  }

  const handleAddAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    insertWaypoint(business as any)
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group cursor-pointer transition-all duration-300",
        isHighlighted ? "opacity-100 scale-[1.02]" : "opacity-90 hover:opacity-100",
        isHorizontal ? "flex flex-row items-center gap-4" : "flex flex-col gap-3"
      )}
    >
      {/* Image Container */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300 bg-slate-100",
        isHorizontal ? "w-32 sm:w-48 aspect-square shrink-0" : "w-full aspect-[4/3] sm:aspect-square",
        isHighlighted ? "shadow-[0_0_0_3px_#E11D48] shadow-rose-600/50" : "shadow-sm group-hover:shadow-md"
      )}>
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt={business.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
             {business.category === 'TRANSPORT' ? <Users className="w-10 h-10" /> : <Briefcase className="w-10 h-10" />}
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
          {business.vehicleType && (
             <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-sm uppercase tracking-wider">
               {business.vehicleType}
             </span>
          )}
          
          {isClaimed && (
            <span className="bg-white/90 text-slate-900 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md flex items-center gap-1 ml-auto">
              <Zap className="w-3 h-3 fill-rose-600 text-rose-600" />
              <span className={isHorizontal ? "hidden sm:inline" : ""}>Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className={cn(
        "flex flex-col",
        isHorizontal ? "flex-1 py-1 h-28 sm:h-40 justify-center sm:justify-between" : "gap-1"
      )}>
        <div className="flex flex-col gap-1">
          <div className={cn(
            "flex justify-between gap-2",
            isHorizontal ? "flex-col sm:flex-row sm:items-start" : "items-start"
          )}>
            <div className={cn("flex-1", isHorizontal ? "line-clamp-2 sm:line-clamp-1" : "line-clamp-1")}>
              {hasProfile ? (
                <Link 
                  href={business.category === 'AGENCY' ? agencyPath(business.slug) : therapistPath(business.slug)} 
                  className={cn(
                    "font-bold text-slate-900 leading-tight hover:text-rose-600 transition-colors",
                    isHorizontal ? "text-base sm:text-lg" : "text-[15px]"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {business.name}
                </Link>
              ) : (
                <h3 className={cn(
                  "font-bold text-slate-900 leading-tight",
                  isHorizontal ? "text-base sm:text-lg" : "text-[15px]"
                )}>
                  {business.name}
                </h3>
              )}
            </div>
            {business.rating !== undefined && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-sm text-slate-900">{business.rating || "New"}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
             <span className="text-rose-600">{business.category}</span>
             {business.reviewsCount !== undefined && <span>• {business.reviewsCount} reviews</span>}
             {business.priceTier && <span>• {business.priceTier}</span>}
          </div>
        </div>

        {/* Action Row */}
        <div className={cn(isHorizontal ? "mt-3 sm:mt-auto" : "mt-2", "flex gap-2")}>
          {hasProfile ? (
            <Link 
              href={business.category === 'AGENCY' ? agencyPath(business.slug) : therapistPath(business.slug)}
              className={cn(
                "flex-1 inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl transition-all",
                isHorizontal ? "py-2 h-9 text-xs sm:text-sm" : "py-5 text-sm"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              View Profile
            </Link>
          ) : isClaimed || business.category === 'TRANSPORT' ? (
            <Button
              onClick={handleBookNow}
              className={cn(
                "flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all",
                isHorizontal ? "py-2 h-9 text-xs sm:text-sm" : "py-5 text-sm"
              )}
            >
              {business.category === 'TRANSPORT' ? 'Contact' : 'Book Now'}
            </Button>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger render={
                <Button 
                  onClick={(e) => e.stopPropagation()} 
                  variant="outline" 
                  className={cn(
                    "flex-1 bg-white text-slate-900 border-gray-200 hover:bg-gray-50 hover:text-slate-900 font-semibold rounded-xl transition-all",
                    isHorizontal ? "py-2 h-9 text-xs sm:text-sm" : "py-5 text-sm"
                  )}
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

          {showAddButton && (
            <Button
              onClick={handleAddAction}
              className={cn(
                "shrink-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-none rounded-xl transition-all",
                isHorizontal ? "w-9 h-9 p-0" : "w-10 py-5"
              )}
              title="Add to Itinerary"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
