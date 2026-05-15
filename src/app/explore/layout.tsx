import { AiConcierge } from "@/features/concierge";
import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: 'Explore the Sacred Valley | VALLECITO',
  description: 'Discover restaurants, hotels, spas, and adventures in Cusco, Urubamba, Pisac, Ollantaytambo and Machu Picchu. AI-powered trip planning.',
  alternates: {
    canonical: `${siteConfig.url}/explore`,
  },
  openGraph: {
    title: 'Explore the Sacred Valley — VALLECITO',
    description: 'Find and book verified local experiences in the Sacred Valley of the Incas. AI concierge helps you plan the perfect day.',
    url: `${siteConfig.url}/explore`,
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore the Sacred Valley — VALLECITO',
    description: 'AI-powered discovery of restaurants, hotels, adventures in Cusco & Sacred Valley.',
    images: ['/images/og-default.jpg'],
  },
};

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
        <AiConcierge />
      </Suspense>
    </>
  );
}
