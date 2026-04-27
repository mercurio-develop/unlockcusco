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
import { Star, Zap } from "lucide-react"
import { generateShadowLead } from "@/app/actions/shadow-lead"

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
}

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  const [touristName, setTouristName] = useState("")
  const [date, setDate] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleConsultar = async () => {
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

  return (
    <Card className="overflow-hidden relative flex flex-col rounded-3xl shadow-sm border-slate-100 hover:shadow-xl transition-all duration-300 group bg-white">
      <div className="relative overflow-hidden">
        <img
          src={business.imageUrl}
          alt={business.name}
          className="object-cover h-56 w-full group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {business.isClaimed && (
          <Badge className="absolute top-4 right-4 bg-[#25D366] hover:bg-green-500 text-white font-bold border-none shadow-lg flex items-center gap-1.5 px-3 py-1.5 z-10 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 fill-current" />
            Instant Booking
          </Badge>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3 gap-4">
          <div>
            <h3 className="text-xl font-bold line-clamp-1 text-slate-900 group-hover:text-indigo-600 transition-colors">{business.name}</h3>
            <Badge variant="secondary" className="mt-2 text-slate-500 bg-slate-100 font-medium px-3 py-1">
              {business.category}
            </Badge>
          </div>
          {business.rating !== null && (
            <div className="flex items-center gap-1.5 bg-yellow-50/80 px-2.5 py-1.5 rounded-lg border border-yellow-100 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm text-yellow-700">{business.rating}</span>
              <span className="text-xs text-yellow-600/70 font-medium">({business.reviewsCount})</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6">
          {business.isClaimed ? (
            <Button className="w-full bg-[#25D366] hover:bg-green-600 text-white font-semibold py-6 rounded-xl shadow-md shadow-green-500/20 transition-all hover:-translate-y-0.5">
              Book Now
            </Button>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger render={
                <Button variant="outline" className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium py-6 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm">
                  Check Availability
                </Button>
              } />
              <DialogContent className="sm:max-w-md p-6 rounded-3xl">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold text-slate-900">Check Availability</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="grid gap-2.5">
                    <Label htmlFor="name" className="text-slate-600 font-medium">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Sarah Jenkins"
                      value={touristName}
                      onChange={(e) => setTouristName(e.target.value)}
                      className="rounded-xl border-slate-200 focus-visible:ring-[#D4AF37] px-4 py-6"
                    />
                  </div>
                  <div className="grid gap-2.5">
                    <Label htmlFor="date" className="text-slate-600 font-medium">Estimated Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-xl border-slate-200 focus-visible:ring-[#D4AF37] px-4 py-6"
                    />
                  </div>
                </div>
                <Button onClick={handleConsultar} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold shadow-lg mt-2">
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