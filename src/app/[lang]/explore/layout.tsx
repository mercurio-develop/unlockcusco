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
    title: isEs ? 'Explorar el Cusco, Valle Sagrado y Machu Picchu | UNLOCKCUSCO' : 'Explore Cusco, the Sacred Valley & Machu Picchu | UNLOCKCUSCO',
    description: isEs 
      ? 'Descubre restaurantes, hoteles, spas y aventuras en Cusco, el Valle Sagrado y Machu Picchu. Planificación de viajes con IA.'
      : 'Discover restaurants, hotels, spas, and adventures in Cusco, the Sacred Valley and Machu Picchu. AI-powered trip planning.',
    alternates: {
      canonical: `${siteConfig.url}/${lang}/explore`,
      languages: {
        en: `${siteConfig.url}/en/explore`,
        es: `${siteConfig.url}/es/explore`,
        'x-default': `${siteConfig.url}/en/explore`,
      }
    },
    openGraph: {
      title: isEs ? 'Explorar el Cusco, Valle Sagrado y Machu Picchu — UNLOCKCUSCO' : 'Explore Cusco, the Sacred Valley & Machu Picchu — UNLOCKCUSCO',
      description: isEs
        ? 'Encuentra y reserva experiencias locales verificadas para explorar el Cusco, Valle Sagrado y Machu Picchu. El conserje con IA te ayuda a planear el día perfecto.'
        : 'Find and book verified local experiences to explore Cusco, the Sacred Valley and Machu Picchu. AI concierge helps you plan the perfect day.',
      url: `${siteConfig.url}/${lang}/explore`,
      images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isEs ? 'Explorar el Cusco, Valle Sagrado y Machu Picchu — UNLOCKCUSCO' : 'Explore Cusco, the Sacred Valley & Machu Picchu — UNLOCKCUSCO',
      description: isEs 
        ? 'Descubrimiento impulsado por IA de restaurantes, hoteles y aventuras en Cusco, Valle Sagrado y Machu Picchu.'
        : 'AI-powered discovery of restaurants, hotels, adventures in Cusco, Sacred Valley & Machu Picchu.',
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
    "name": "Explore the Sacred Valley | UNLOCKCUSCO",
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
