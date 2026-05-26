import { HeroSection, FeaturesSection } from "@/features/landing"
import { siteConfig } from "@/lib/config/site"
import type { Metadata } from "next"
import { getDictionary, Locale } from "@/lib/dictionaries"


interface PageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const isEs = lang === 'es'
  const title = isEs ? "Explorar el Cusco, Valle Sagrado y Machu Picchu | UNLOCKCUSCO" : "Explore Cusco, the Sacred Valley & Machu Picchu | UNLOCKCUSCO"
  const description = isEs 
    ? "Descubre experiencias, joyas ocultas e itinerarios para explorar el Cusco, Valle Sagrado y Machu Picchu. Reserva directamente sin comisiones." 
    : "Discover experiences, hidden gems, and itineraries to explore Cusco, the Sacred Valley and Machu Picchu. Book directly with no commissions."

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}`,
      languages: {
        en: `${siteConfig.url}/en`,
        es: `${siteConfig.url}/es`,
        'x-default': `${siteConfig.url}/en`,
      }
    }
  }
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "description": siteConfig.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/${lang}/explore?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection dict={dict.home} />
      <FeaturesSection dict={dict.home} />

    </div>
  )
}
