  import { Utensils, Sprout, Mountain as MountainIcon, Bed, Landmark, Ticket, Car, Scissors, Library, Sparkles, MapPin, Compass } from "lucide-react"

export const DEFAULT_CATEGORY_THEME = "bg-rose-50 text-rose-600 border-rose-100/50";
export const DEFAULT_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop";

export const CATEGORIES = [
  { label: "Templates", value: "Template", icon: Library, theme: "bg-slate-50 text-slate-700 border-slate-200/50", fallbackImage: DEFAULT_CATEGORY_IMAGE },
  { label: "Tourist Ticket", value: "Boleto", icon: Ticket, theme: "bg-sky-50 text-sky-700 border-sky-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
  { label: "Adventure", value: "Adventure", icon: MountainIcon, theme: "bg-emerald-50 text-emerald-700 border-emerald-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
  { label: "Wellness", value: "Wellness", icon: Sprout, theme: "bg-teal-50 text-teal-700 border-teal-200/50", fallbackImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop" },
  { label: "Spiritual", value: "Spiritual", icon: Sparkles, theme: "bg-indigo-50 text-indigo-700 border-indigo-200/50", fallbackImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop" },
  { label: "Dining", value: "Dining", icon: Utensils, theme: "bg-amber-50 text-amber-700 border-amber-200/50", fallbackImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop" },
  { label: "Textiles", value: "Textiles", icon: Scissors, theme: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
  { label: "Stays", value: "Stays", icon: Bed, theme: "bg-blue-50 text-blue-700 border-blue-200/50", fallbackImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop" },
  { label: "Transport", value: "Transport", icon: Car, theme: "bg-slate-50 text-slate-700 border-slate-200/50", fallbackImage: DEFAULT_CATEGORY_IMAGE },
  { label: "Agency", value: "Agency", icon: Compass, theme: "bg-orange-50 text-orange-700 border-orange-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
]

export function getCategoryData(categoryValue: string | undefined | null) {
  if (!categoryValue) return { label: "Unknown", value: "Unknown", icon: MapPin, theme: DEFAULT_CATEGORY_THEME, fallbackImage: DEFAULT_CATEGORY_IMAGE };
  const cat = CATEGORIES.find(c => c.value.toLowerCase() === categoryValue.toLowerCase());
  return cat || { label: categoryValue, value: categoryValue, icon: MapPin, theme: DEFAULT_CATEGORY_THEME, fallbackImage: DEFAULT_CATEGORY_IMAGE };
}

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

export const DICTIONARIES = {
  exploreMap: {
    backToList: "Back to list",
    showList: "Show List",
    searchThisArea: "Search this area",
    viewDetails: "View details",
    noResults: "No results in this area",
  },
  basicTemplate: {
    about: "About",
    generalInfo: "General Information",
    defaultDesc: "Discover an authentic experience in the heart of the Sacred Valley. Visit us to learn more about our services and offerings.",
    areYouOwner: "Are you the owner?",
    claimPrompt: "Claim this business profile to unlock premium templates, showcase your services, and connect directly with tourists via WhatsApp.",
    claimBtn: "Claim Business Profile"
  },
  cultureTemplate: {
    livingHeritage: "Living Heritage",
    subtitle: "Discover the artisans and ancient processes",
    localArtisans: "Local Artisans",
    localArtisansDesc: "Meet the master weavers and creators preserving ancestral knowledge.",
    ancientTech: "Ancient Techniques",
    ancientTechDesc: "Experience natural dyeing and backstrap loom weaving in person.",
    authenticGoods: "Authentic Goods",
    authenticGoodsDesc: "Support local families by purchasing genuine, handmade textiles.",
    experiences: "Experiences & Workshops",
    defaultDesc: "An immersive cultural experience guided by local experts.",
    walkIn: "Walk-in visits are welcome. Check availability for guided tours."
  },
  staysTemplate: {
    accommodation: "Accommodation & Amenities",
    subtitle: "Your home in the Sacred Valley",
    checkIn: "Check-in",
    checkInTime: "3:00 PM",
    checkOut: "Check-out",
    checkOutTime: "11:00 AM",
    rooms: "Rooms & Suites",
    defaultDesc: "A peaceful retreat offering comfort and authentic hospitality.",
    bookNow: "Book your stay directly with us for the best rates."
  },
  discoverPanel: {
    places: "Places",
  },
  interactiveList: {
    searchPlaceholder: "Search...", // Component will adapt dynamically
    sort: "Sort:",
    recommended: "Recommended",
    noResultsTitle: "No results found",
    noResultsDesc: "Try adjusting your search query or sorting options.",
    sortOptions: {
      recommended: "Recommended",
      rating_desc: "Highest Rated",
      reviews_desc: "Most Reviews"
    }
  },
  interactiveListEs: {
    searchPlaceholder: "Buscar...",
    sort: "Ordenar:",
    recommended: "Recomendado",
    noResultsTitle: "No se encontraron resultados",
    noResultsDesc: "Intenta ajustar tu búsqueda o las opciones de ordenamiento.",
    sortOptions: {
      recommended: "Recomendado",
      rating_desc: "Mejor Valorado",
      reviews_desc: "Más Reseñas"
    }
  },
  businessCard: {
    reviews: "reviews",
    closed: "Closed",
    open: "Open",
    viewDetails: "View Details",
  },
  exploreView: {
    exploreUnlockCusco: "Explore UnlockCusco",
    discover: "Discover",
    concierge: "Concierge",
    itinerary: "Itinerary",
    featureDisabled: "Feature disabled"
  }
}

