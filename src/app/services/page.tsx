import Link from "next/link"
import { Building2, HeartPulse, Car, UtensilsCrossed, BedDouble } from "lucide-react"
import { agenciesPath, therapistsPath, transportPath, restaurantsPath, lodgingPath } from "@/paths"

const categories = [
  {
    title: "Restaurants & Dining",
    description: "Top-rated local restaurants, cafes, and picanterías.",
    icon: UtensilsCrossed,
    href: restaurantsPath(),
    color: "bg-rose-50 text-rose-600",
    hover: "group-hover:bg-rose-100",
    accent: "group-hover:text-rose-600",
  },
  {
    title: "Lodging & Stays",
    description: "Hotels, ecolodges, hostels, and glamping across the Sacred Valley.",
    icon: BedDouble,
    href: lodgingPath(),
    color: "bg-indigo-50 text-indigo-600",
    hover: "group-hover:bg-indigo-100",
    accent: "group-hover:text-indigo-600",
  },
  {
    title: "Agencies & Expeditions",
    description: "Verified agencies for mountain treks, cultural tours, and Andean explorations.",
    icon: Building2,
    href: agenciesPath(),
    color: "bg-blue-50 text-blue-600",
    hover: "group-hover:bg-blue-100",
    accent: "group-hover:text-blue-600",
  },
  {
    title: "Healers & Sanctuaries",
    description: "Traditional therapists, spiritual guides, and holistic wellness spaces.",
    icon: HeartPulse,
    href: therapistsPath(),
    color: "bg-emerald-50 text-emerald-600",
    hover: "group-hover:bg-emerald-100",
    accent: "group-hover:text-emerald-600",
  },
  {
    title: "Business & Taxis",
    description: "Reliable drivers and local combis across the Sacred Valley.",
    icon: Car,
    href: transportPath(),
    color: "bg-amber-50 text-amber-600",
    hover: "group-hover:bg-amber-100",
    accent: "group-hover:text-amber-600",
  },
]

export default function ServicesDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Services Directory</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Everything you need for a frictionless journey across the Sacred Valley.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group block bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${cat.color} ${cat.hover}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h2 className={`text-xl font-bold text-slate-900 mb-3 transition-colors ${cat.accent}`}>
                  {cat.title}
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">{cat.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
