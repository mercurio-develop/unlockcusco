 
import { ShieldCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface AsociadoBadgeProps {
  className?: string
  showText?: boolean
}

export function AsociadoBadge({ className, showText = true }: AsociadoBadgeProps) {
  return (
    <div className={cn(
      "bg-white/95 backdrop-blur-md border border-rose-200/50 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.2)] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all hover:scale-105 group",
      className
    )}>
      <div className="relative">
        <ShieldCheck className="w-4 h-4 text-rose-600" />
        <Zap className="w-2 h-2 fill-rose-600 text-rose-600 absolute -bottom-0.5 -right-0.5 animate-pulse" />
      </div>
      {showText && (
        <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-tighter flex flex-col leading-none">
          <span className="text-rose-600">UnlockCusco</span>
          <span>Asociado</span>
        </span>
      )}
    </div>
  )
}
