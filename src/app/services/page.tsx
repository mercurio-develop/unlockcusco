import Link from "next/link"
import { Building2, HeartPulse, Car } from "lucide-react"
import { agenciesPath, therapistsPath, transportPath } from "@/paths"

export default function ServicesDashboard() {
  const categories = [
    {
      title: "Agencies & Expeditions",
      description: "Discover verified local agencies offering mountain treks, cultural tours, and deep Andean explorations.",
      icon: Building2,
      href: agenciesPath(),
      color: "bg-blue-50 text-blue-600",
      hoverColor: "group-hover:bg-blue-100",
    },
    {
      title: "Healers & Sanctuaries",
      description: "Connect with traditional therapists, spiritual guides, and private sanctuaries for holistic wellness.",
      icon: HeartPulse,
      href: therapistsPath(),
      color: "bg-emerald-50 text-emerald-600",
      hoverColor: "group-hover:bg-emerald-100",
    },
    {
      title: "Transport & Taxis",
      description: "Reliable drivers, private taxis, and local combis to move safely and efficiently across the Sacred Valley.",
      icon: Car,
      href: transportPath(),
      color: "bg-amber-50 text-amber-600",
      hoverColor: "group-hover:bg-amber-100",
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Services Directory</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Everything you need for a frictionless journey. From trusted expedition guides to reliable transport, find vetted professionals across the Sacred Valley.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link 
                key={category.title} 
                href={category.href}
                className="group block bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${category.color} ${category.hoverColor}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">
                  {category.title}
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {category.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
