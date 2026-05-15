  import { Utensils, Sprout, Mountain as MountainIcon, Bed, Landmark, Ticket, Car, Scissors, Library, Sparkles } from "lucide-react"

export const CATEGORIES = [
  { label: "Templates", value: "Template", icon: Library },
  { label: "Tourist Ticket", value: "Boleto", icon: Ticket },
  { label: "Adventure", value: "Adventure", icon: MountainIcon },
  { label: "Wellness", value: "Wellness", icon: Sprout },
  { label: "Spiritual", value: "Spiritual", icon: Sparkles },
  { label: "Dining", value: "Dining", icon: Utensils },
  { label: "Culture", value: "Culture", icon: Landmark },
  { label: "Textiles", value: "Textiles", icon: Scissors },
  { label: "Stays", value: "Stays", icon: Bed },
  { label: "Transport", value: "Transport", icon: Car },
]

export const LOCATIONS = [
  { label: "Urubamba", value: "urubamba" },
  { label: "Pisac", value: "pisac" },
  { label: "Maras", value: "maras" },
  { label: "Ollantaytambo", value: "ollantaytambo" },
  { label: "Chinchero", value: "chinchero" },
  { label: "Calca", value: "calca" },
  { label: "Yucay", value: "yucay" },
  { label: "Cusco", value: "cusco" },
  { label: "Machu Picchu", value: "machu-picchu" },
]

export const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Highest Rated", value: "rating_desc" },
  { label: "Price (Low to High)", value: "price_asc" },
  { label: "Price (High to Low)", value: "price_desc" },
]

export const RADIUS_MARKS: number[] = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 10, 15];
