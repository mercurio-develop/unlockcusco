import { Compass, MapPin, ShoppingBag, Utensils, Leaf, Wine, Sparkles, Map, Bed, Route, List } from "lucide-react";

export function getSuggestions(travelVibe: string, isEs: boolean, panelMode?: "discover" | "itinerary", mobileViewMode?: "list" | "map") {
  const iconClass = "w-3.5 h-3.5 text-rose-500";

  // Context-aware suggestions based on current UI state
  if (panelMode === 'itinerary') {
    return [
      { label: isEs ? "Optimizar mi ruta" : "Optimize my route", icon: <Route className={iconClass} /> },
      { label: isEs ? "Añadir parada para cenar" : "Add a dinner spot", icon: <Utensils className={iconClass} /> },
      { label: isEs ? "Añadir parada de descanso" : "Add a rest stop", icon: <Bed className={iconClass} /> },
      { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: <Map className={iconClass} /> }
    ];
  }

  if (mobileViewMode === 'map' || panelMode === 'discover') {
    return [
      { label: isEs ? "¿Qué hay cerca de mí?" : "What's good near me?", icon: <MapPin className={iconClass} /> },
      { label: isEs ? "Top 10 restaurantes" : "Top 10 restaurants", icon: <List className={iconClass} /> },
      { label: isEs ? "Top 10 hoteles" : "Top 10 stays", icon: <List className={iconClass} /> },
    ];
  }

  // Fallback to vibe-based suggestions
  switch (travelVibe) {
    case 'Explorer':
      return [
        { label: isEs ? "Mejores caminatas cerca" : "Best hikes near me", icon: <Compass className={iconClass} /> },
        { label: isEs ? "Sitios arqueológicos poco conocidos" : "Off-the-beaten-path archeological sites", icon: <MapPin className={iconClass} /> },
        { label: isEs ? "Días de mercado local" : "Market day schedule", icon: <ShoppingBag className={iconClass} /> },
        { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: <Map className={iconClass} /> }
      ];
    case 'Foodie':
      return [
        { label: isEs ? "Top 10 restaurantes" : "Top 10 restaurants", icon: <List className={iconClass} /> },
        { label: isEs ? "Comida de la granja a la mesa" : "Farm-to-table dining", icon: <Leaf className={iconClass} /> },
        { label: isEs ? "Lugares para probar Pisco" : "Pisco tasting spots", icon: <Wine className={iconClass} /> },
        { label: isEs ? "Mejor ceviche local" : "Best local ceviche", icon: <Utensils className={iconClass} /> },
      ];
    case 'Luxury':
      return [
        { label: isEs ? "Mejor spa en el valle" : "Best spa in the valley", icon: <Sparkles className={iconClass} /> },
        { label: isEs ? "Top 10 hoteles" : "Top 10 stays", icon: <List className={iconClass} /> },
        { label: isEs ? "Alta cocina con vistas" : "Fine dining with views", icon: <Utensils className={iconClass} /> },
        { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: <Map className={iconClass} /> }
      ];
    default:
      return [
        { label: isEs ? "¿Qué hay cerca de mí?" : "What's good near me?", icon: <MapPin className={iconClass} /> },
        { label: isEs ? "Top 10 restaurantes" : "Top 10 restaurants", icon: <List className={iconClass} /> },
        { label: isEs ? "Top 10 hoteles" : "Top 10 stays", icon: <List className={iconClass} /> },
        { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: <Map className={iconClass} /> }
      ];
  }
}
