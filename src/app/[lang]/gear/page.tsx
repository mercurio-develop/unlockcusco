import { Metadata } from "next";
import { ProductCard } from "@/components/ui/product-card";

export const metadata: Metadata = {
  title: "Essential Gear & Stays for Peru",
  description: "Curated packing lists, top-rated gear, and the best places to stay for your trip to Cusco, the Sacred Valley, and Machu Picchu.",
};

const GEAR_ITEMS = [
  {
    title: "LifeStraw Go Series Water Filter Bottle",
    description: "Tap water in Peru isn't safe to drink. This bottle filters out 99.999% of bacteria and parasites, saving you money and reducing plastic waste during your treks.",
    category: "Health & Safety",
    price: "$39.95",
    link: "https://www.amazon.com/dp/B01G7SQBPQ?tag=unlockcusco-20", // Placeholder affiliate tag
    provider: "Amazon" as const,
    ctaText: "Check on Amazon",
  },
  {
    title: "Columbia Men's Watertight II Jacket",
    description: "The weather in the Andes changes rapidly. A lightweight, packable rain jacket is absolutely essential for Machu Picchu and the Sacred Valley.",
    category: "Clothing & Gear",
    price: "$59.99",
    link: "https://www.amazon.com/dp/B00DQYQ28Q?tag=unlockcusco-20",
    provider: "Amazon" as const,
    ctaText: "Check on Amazon",
  },
  {
    title: "Salomon Men's X Ultra 3 MID GTX Hiking Boots",
    description: "You'll be walking on uneven cobblestones and steep Inca trails. Good ankle support and waterproofing are non-negotiable for a comfortable trip.",
    category: "Clothing & Gear",
    price: "$165.00",
    link: "https://www.amazon.com/dp/B06X9NZ5T2?tag=unlockcusco-20",
    provider: "Amazon" as const,
    ctaText: "Check on Amazon",
  }
];

const HOTEL_ITEMS = [
  {
    title: "Tambo del Inka, a Luxury Collection Resort",
    description: "The absolute best luxury base in the Sacred Valley. Located in Urubamba, it even has its own private train station to Machu Picchu.",
    category: "Luxury Stays",
    link: "https://www.booking.com/hotel/pe/tambo-del-inka-a-luxury-collection-resort-spa-valle-sagrado.html?aid=YOUR_AFFILIATE_ID",
    provider: "Booking.com" as const,
    ctaText: "Check Availability",
  },
  {
    title: "Selina Plaza de Armas Cusco",
    description: "A beautiful, vibrant hub right on the main square. Perfect for digital nomads or travelers looking to meet people, offering both dorms and private suites.",
    category: "Boutique / Social",
    link: "https://www.booking.com/hotel/pe/selina-plaza-de-armas-cusco.html?aid=YOUR_AFFILIATE_ID",
    provider: "Booking.com" as const,
    ctaText: "Check Availability",
  }
];

export default async function GearHubPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';

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
          We may earn a small commission if you book or buy through these links, at no extra cost to you. This helps support our free guides!
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
