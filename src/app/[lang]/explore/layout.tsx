import { AiConciergeClient } from "@/features/concierge";
import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === 'es';
  
  return {
    title: isEs ? 'Explorar el Valle Sagrado | VALLECITO' : 'Explore the Sacred Valley | VALLECITO',
    description: isEs 
      ? 'Descubre restaurantes, hoteles, spas y aventuras en Cusco, Urubamba, Pisac, Ollantaytambo y Machu Picchu. Planificación de viajes con IA.'
      : 'Discover restaurants, hotels, spas, and adventures in Cusco, Urubamba, Pisac, Ollantaytambo and Machu Picchu. AI-powered trip planning.',
    alternates: {
      canonical: `${siteConfig.url}/${lang}/explore`,
      languages: {
        en: `${siteConfig.url}/en/explore`,
        es: `${siteConfig.url}/es/explore`,
        'x-default': `${siteConfig.url}/en/explore`,
      }
    },
    openGraph: {
      title: isEs ? 'Explorar el Valle Sagrado — VALLECITO' : 'Explore the Sacred Valley — VALLECITO',
      description: isEs
        ? 'Encuentra y reserva experiencias locales verificadas en el Valle Sagrado de los Incas. El conserje con IA te ayuda a planear el día perfecto.'
        : 'Find and book verified local experiences in the Sacred Valley of the Incas. AI concierge helps you plan the perfect day.',
      url: `${siteConfig.url}/${lang}/explore`,
      images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isEs ? 'Explorar el Valle Sagrado — VALLECITO' : 'Explore the Sacred Valley — VALLECITO',
      description: isEs 
        ? 'Descubrimiento impulsado por IA de restaurantes, hoteles y aventuras en Cusco y el Valle Sagrado.'
        : 'AI-powered discovery of restaurants, hotels, adventures in Cusco & Sacred Valley.',
      images: ['/images/og-default.jpg'],
    },
  };
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Explore the Sacred Valley | VALLECITO",
    "description": "Discover restaurants, hotels, spas, and adventures in Cusco, Urubamba, Pisac, Ollantaytambo and Machu Picchu. AI-powered trip planning.",
    "url": `${siteConfig.url}/explore`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
      <Suspense fallback={null}>
        <AiConciergeClient />
      </Suspense>
    </>
  );
}
