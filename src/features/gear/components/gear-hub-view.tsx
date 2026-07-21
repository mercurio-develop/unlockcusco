import { ProductCard } from "@/components/ui/product-card";
import type { Locale } from "@/paths";
import { GEAR_ITEMS, HOTEL_ITEMS } from "../constants";

export function GearHubView({ lang }: { lang: Locale }) {
  const isEs = lang === "es";

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 pb-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
          {isEs ? "Equipamiento y Alojamientos" : "Essential Gear & Stays"}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {isEs
            ? "Nuestra lista cuidadosamente seleccionada de equipo imprescindible para la montaña y los mejores lugares para alojarse en los Andes."
            : "Our curated packing list of mountain-ready gear and the best places to base yourself in the Andes."}
        </p>
        <p className="text-xs text-slate-400 mt-4 max-w-md mx-auto">
          We may earn a small commission if you book or buy through these links,
          at no extra cost to you. This helps support our free guides!
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold font-serif text-slate-900 mb-8 border-b border-slate-100 pb-4">
          {isEs ? "El Equipo Imprescindible" : "The Ultimate Packing List"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GEAR_ITEMS.map((item, index) => (
            <ProductCard key={index} {...item} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif text-slate-900 mb-8 border-b border-slate-100 pb-4">
          {isEs ? "Dónde Alojarse" : "Where to Stay"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOTEL_ITEMS.map((item, index) => (
            <ProductCard key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
