  import { Utensils, Sprout, Mountain as MountainIcon, Bed, Ticket, Car, Scissors, Library, Sparkles, MapPin, Compass, Landmark, User } from "lucide-react"

export const DEFAULT_CATEGORY_THEME = "bg-rose-50 text-rose-600 border-rose-100/50";
export const DEFAULT_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop";

export const CATEGORIES = [
  { label: "Templates", value: "Template", icon: Library, theme: "bg-slate-50 text-slate-700 border-slate-200/50", fallbackImage: DEFAULT_CATEGORY_IMAGE },
  { label: "Tourist Ticket", value: "Boleto", icon: Ticket, theme: "bg-sky-50 text-sky-700 border-sky-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
  { label: "Adventure", value: "Adventure", icon: MountainIcon, theme: "bg-emerald-50 text-emerald-700 border-emerald-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
  { label: "Wellness", value: "Wellness", icon: Sprout, theme: "bg-teal-50 text-teal-700 border-teal-200/50", fallbackImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop" },
  { label: "Spiritual", value: "Spiritual", icon: Sparkles, theme: "bg-indigo-50 text-indigo-700 border-indigo-200/50", fallbackImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop" },
  { label: "Culture", value: "Culture", icon: Landmark, theme: "bg-purple-50 text-purple-700 border-purple-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
  { label: "Dining", value: "Dining", icon: Utensils, theme: "bg-amber-50 text-amber-700 border-amber-200/50", fallbackImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop" },
  { label: "Textiles", value: "Textiles", icon: Scissors, theme: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
  { label: "Stays", value: "Stays", icon: Bed, theme: "bg-blue-50 text-blue-700 border-blue-200/50", fallbackImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop" },
  { label: "Transport", value: "Transport", icon: Car, theme: "bg-slate-50 text-slate-700 border-slate-200/50", fallbackImage: DEFAULT_CATEGORY_IMAGE },
  { label: "Agency", value: "Agency", icon: Compass, theme: "bg-orange-50 text-orange-700 border-orange-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
  { label: "Guide", value: "Guide", icon: User, theme: "bg-cyan-50 text-cyan-700 border-cyan-200/50", fallbackImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop" },
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

export const TOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  pisac: { lat: -13.422, lng: -71.848 },
  urubamba: { lat: -13.304, lng: -72.115 },
  calca: { lat: -13.332, lng: -71.954 },
  cusco: { lat: -13.522, lng: -71.967 },
  huaran: { lat: -13.315, lng: -72.036 },
  arin: { lat: -13.317, lng: -72.052 },
  yucay: { lat: -13.319, lng: -72.088 },
  huayoccari: { lat: -13.328, lng: -72.062 },
  maras: { lat: -13.333, lng: -72.155 },
  ollantaytambo: { lat: -13.258, lng: -72.263 },
  chinchero: { lat: -13.398, lng: -72.045 },
  "machu-picchu": { lat: -13.163, lng: -72.545 },
};

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
    placesHere: "places here",
    tapMapStart: "Tap map to set Start",
    tapMapEnd: "Tap map to set End",
    cancel: "Cancel"
  },
  basicTemplate: {
    about: "About",
    generalInfo: "General Information",
    defaultDesc: "Discover an authentic experience in the heart of the Sacred Valley. Visit us to learn more about our services and offerings.",
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
    accommodations: "Accommodations",
    subtitle: "Rest in the heart of the Sacred Valley",
    freeWifi: "Free WiFi",
    breakfast: "Breakfast",
    heating: "Heating",
    central: "Central",
    defaultDesc: "A comfortable space designed for rest and acclimatization.",
    premiumSuite: "Premium Suite",
    perNight: "/ night",
    noRooms: "Room details are being updated. Check availability for more info."
  },
  expeditionTemplate: {
    title: "Trekking & Circuits",
    subtitle: "Upcoming available expeditions",
    days: "Days",
    highlights: "Highlights",
    included: "Included",
    priceFrom: "Price from",
    perPerson: "per person",
    intensity: "Intensity",
    emptyState: "Searching for new trails. Expedition dates coming soon!"
  },
  gastronomicTemplate: {
    title: "Menu Highlights",
    subtitle: "Flavors of the Sacred Valley",
    signatureDish: "Signature Dish",
    emptyState: "The digital menu is being updated. Stay tuned!"
  },
  sanctuaryTemplate: {
    title: "Healing & Wellness",
    subtitle: "Our rituals combine ancestral Andean wisdom with modern techniques to restore your vital balance.",
    minutes: "Minutes",
    details: "Details",
    emptyState: "Preparing the sacred space. Sanctuary sessions available soon."
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
    setStart: "Set as Start",
    setEnd: "Set as End",
    viewProfile: "View Profile",
    whatsapp: "WhatsApp",
    requiresBoleto: "Requires Boleto Turístico",
    boletoTitle: "Cusco Tourist Ticket (BTC)",
    boletoDesc1: "This site requires the",
    boletoDesc2: "It's a unified government-managed ticket allowing access to up to 16 major archaeological sites and museums in Cusco and the Sacred Valley.",
    options: "Options:",
    fullTicket: "Full Ticket (130 Soles):",
    fullTicketDesc: "Valid for 10 days. Includes all 16 sites across Cusco, Sacred Valley, and South Valley.",
    partialTicket: "Partial Ticket (70 Soles):",
    partialTicketDesc: "Valid for 1-2 days for a specific circuit (e.g., Sacred Valley ruins only).",
    note: "Note: The ticket cannot be purchased online in advance. It must be bought in person at the COSITUC office (Av. El Sol 103, Cusco) or at the entrance of the first site you visit.",
    gotIt: "Got it",
    selected: "Selected",
    swap: "Swap",
    exchange: "Exchange",
    add: "Add",
    map: "Map",
    details: "Details",
    verified: "Verified",
    reviews: "reviews",
    closed: "Closed",
    open: "Open",
    viewDetails: "View Details",
  },
  explore: {
    searchPlaceholder: "Search Sacred Valley...",
    filters: "Filters",
    resetAll: "Reset All",
    townSector: "Town / Sector",
    anywhere: "Anywhere",
    categoriesLabel: "Categories",
    all: "All",
    radiusSearch: "Radius Search",
    locating: "Locating...",
    usingGps: "Using GPS",
    myLocation: "My Location",
    viewResults: "View Results",
    categories: {}
  },
  itineraryPanel: {
    emptyTitle: "Your itinerary is empty",
    emptyDesc: "Add places from the Discover view or the Concierge chat.",
    startPoint: "Start Point",
    startPlaceholder: "Where does your day start?",
    viewMap: "View Map",
    setMarker: "Set Marker",
    cancel: "Cancel",
    delete: "Delete",
    removeStop: "Remove Stop",
    areYouSure: "Are you sure you want to remove",
    fromItinerary: "from your itinerary?",
    remove: "Remove",
    swap: "Swap",
    endHere: "End Here",
    addStop: "Add Stop",
    endPoint: "End Point",
    endPlaceholder: "Where does your day end?",
    arrives: "Arrives",
    saveRoute: "Save Route",
    shareRoute: "Share",
    routeSaved: "Route Saved",
    routeSavedDesc: "Share this link with your friends so they can view your itinerary.",
    copy: "Copy",
    copied: "Copied",
    close: "Close"
  },
  itineraryPanelEs: {
    emptyTitle: "Tu itinerario está vacío",
    emptyDesc: "Añade lugares desde la vista Descubrir o el Chat Concierge.",
    startPoint: "Punto de Partida",
    startPlaceholder: "¿Dónde empieza tu día?",
    viewMap: "Ver Mapa",
    setMarker: "Poner Marcador",
    cancel: "Cancelar",
    delete: "Eliminar",
    removeStop: "Eliminar Parada",
    areYouSure: "¿Estás seguro de que quieres eliminar",
    fromItinerary: "de tu itinerario?",
    remove: "Eliminar",
    swap: "Cambiar",
    endHere: "Terminar Aquí",
    addStop: "Añadir Parada",
    endPoint: "Punto Final",
    endPlaceholder: "¿Dónde termina tu día?",
    arrives: "Llega",
    saveRoute: "Guardar Ruta",
    shareRoute: "Compartir",
    routeSaved: "Ruta Guardada",
    routeSavedDesc: "Comparte este enlace con tus amigos para que puedan ver tu itinerario.",
    copy: "Copiar",
    copied: "Copiado",
    close: "Cerrar"
  },
  exploreView: {
    exploreUnlockCusco: "Explore",
    discover: "Discover",
    concierge: "Concierge",
    itinerary: "Itinerary",
    featureDisabled: "Feature disabled"
  }
}

