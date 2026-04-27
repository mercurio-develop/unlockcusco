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
    <Card className="overflow-hidden relative flex flex-col">
      <div className="relative">
        <img
          src={business.imageUrl}
          alt={business.name}
          className="object-cover h-48 w-full"
        />
        {business.isClaimed && (
          <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white font-bold border-none shadow-md flex items-center gap-1 z-10">
            <Zap className="h-3 w-3 fill-current" />
            Reserva Inmediata
          </Badge>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold line-clamp-1">{business.name}</h3>
            <Badge variant="secondary" className="mt-1 text-gray-500">
              {business.category}
            </Badge>
          </div>
          {business.rating !== null && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">{business.rating}</span>
              <span className="text-xs text-gray-500">({business.reviewsCount})</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4">
          {business.isClaimed ? (
            <Button className="w-full bg-[#25D366] hover:bg-green-600 text-white font-semibold">
              Reservar Ahora
            </Button>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger render={
                <Button variant="outline" className="w-full text-gray-600 border-gray-300">
                  Consultar Disponibilidad
                </Button>
              } />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Consultar Disponibilidad</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tu Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej. Juan Pérez"
                      value={touristName}
                      onChange={(e) => setTouristName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha Estimada</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleConsultar} className="w-full">
                  Enviar Consulta
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  )
}