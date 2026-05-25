import { Compass, MapPin, ShoppingBag, Car, Utensils, Leaf, Wine, Sparkles, Map, Lightbulb, Bed } from "lucide-react";

export function getSuggestions(travelVibe: string, isEs: boolean) {
  const iconClass = "w-3.5 h-3.5 text-rose-500";

  switch (travelVibe) {
    case 'Explorer':
      return [
        { label: isEs ? "Mejores caminatas cerca" : "Best hikes near me", icon: <Compass className={iconClass} /> },
        { label: isEs ? "Ruinas poco conocidas" : "Off-the-beaten-path ruins", icon: <MapPin className={iconClass} /> },
        { label: isEs ? "Días de mercado local" : "Market day schedule", icon: <ShoppingBag className={iconClass} /> },
        { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: <Car className={iconClass} /> }
      ];
    case 'Foodie':
      return [
        { label: isEs ? "Mejor ceviche local" : "Best local ceviche", icon: <Utensils className={iconClass} /> },
        { label: isEs ? "Comida de la granja a la mesa" : "Farm-to-table dining", icon: <Leaf className={iconClass} /> },
        { label: isEs ? "Lugares para probar Pisco" : "Pisco tasting spots", icon: <Wine className={iconClass} /> },
        { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: <Car className={iconClass} /> }
      ];
    case 'Luxury':
      return [
        { label: isEs ? "Mejor spa en el valle" : "Best spa in the valley", icon: <Sparkles className={iconClass} /> },
        { label: isEs ? "Contratar conductor privado" : "Hire a private driver", icon: <Car className={iconClass} /> },
        { label: isEs ? "Alta cocina con vistas" : "Fine dining with views", icon: <Utensils className={iconClass} /> },
        { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: <Map className={iconClass} /> }
      ];
    default:
      return [
        { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: <Map className={iconClass} /> },
        { label: isEs ? "Buscar Restaurante" : "Find a Restaurant", icon: <Utensils className={iconClass} /> },
        { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: <Car className={iconClass} /> },
        { label: isEs ? "Tips locales" : "Local Travel Tips", icon: <Lightbulb className={iconClass} /> },
        { label: isEs ? "Buscar un Hotel" : "Find a Hotel", icon: <Bed className={iconClass} /> }
      ];
  }
}
