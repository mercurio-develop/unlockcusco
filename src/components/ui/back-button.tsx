"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  fallbackHref?: string
  className?: string
  label?: string
}

export function BackButton({ fallbackHref = "/explore", className, label = "Explore" }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (window.history.length > 2) {
          router.back()
        } else {
          router.push(fallbackHref)
        }
      }}
      className={cn("flex items-center gap-2 text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-full transition-colors text-sm font-medium", className)}
    >
      <ArrowLeft className="w-4 h-4" /> {label}
    </button>
  )
}
