export function getSuggestions(travelVibe: string, isEs: boolean) {
  switch (travelVibe) {
    case 'Explorer':
      return [
        { label: isEs ? "Mejores caminatas cerca" : "Best hikes near me", icon: "🥾", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
        { label: isEs ? "Ruinas poco conocidas" : "Off-the-beaten-path ruins", icon: "🏺", theme: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
        { label: isEs ? "Días de mercado local" : "Market day schedule", icon: "🧶", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
        { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: "🚕", theme: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" }
      ];
    case 'Foodie':
      return [
        { label: isEs ? "Mejor ceviche local" : "Best local ceviche", icon: "🐟", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
        { label: isEs ? "Comida de la granja a la mesa" : "Farm-to-table dining", icon: "🌽", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
        { label: isEs ? "Lugares para probar Pisco" : "Pisco tasting spots", icon: "🍸", theme: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
        { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: "🚕", theme: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" }
      ];
    case 'Luxury':
      return [
        { label: isEs ? "Mejor spa en el valle" : "Best spa in the valley", icon: "💆‍♀️", theme: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
        { label: isEs ? "Contratar conductor privado" : "Hire a private driver", icon: "🚙", theme: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
        { label: isEs ? "Alta cocina con vistas" : "Fine dining with views", icon: "🥂", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
        { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: "🌅", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" }
      ];
    default:
      return [
        { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: "🌅", theme: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
        { label: isEs ? "Buscar Restaurante" : "Find a Restaurant", icon: "🍽️", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
        { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: "🚕", theme: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
        { label: isEs ? "Tips locales" : "Local Travel Tips", icon: "💡", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
        { label: isEs ? "Buscar un Hotel" : "Find a Hotel", icon: "🏨", theme: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" }
      ];
  }
}
