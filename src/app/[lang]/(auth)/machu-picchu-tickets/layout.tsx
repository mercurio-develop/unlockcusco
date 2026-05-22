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
    title: isEs ? "Disponibilidad de Boletos a Machu Picchu y Trenes | UNLOCKCUSCO" : "Machu Picchu Tickets & Trains Availability | UNLOCKCUSCO",
    description: isEs 
      ? "Consulta la disponibilidad en vivo para los boletos de ingreso a la Llaqta de Machu Picchu y trenes desde Ollantaytambo. Entradas oficiales, sin recargos."
      : "Check live availability for Machu Picchu Llaqta entrance tickets and trains from Ollantaytambo. Official tickets, no markups.",
    alternates: {
      canonical: `${siteConfig.url}/${lang}/machu-picchu-tickets`,
      languages: {
        en: `${siteConfig.url}/en/machu-picchu-tickets`,
        es: `${siteConfig.url}/es/machu-picchu-tickets`,
        'x-default': `${siteConfig.url}/en/machu-picchu-tickets`,
      }
    },
    openGraph: {
      title: isEs ? "Disponibilidad de Boletos a Machu Picchu y Trenes" : "Machu Picchu Tickets & Trains Availability",
      description: isEs 
        ? "Consulta la disponibilidad en vivo para boletos a Machu Picchu y trenes desde Ollantaytambo."
        : "Check live availability for Machu Picchu Llaqta entrance tickets and trains from Ollantaytambo.",
      url: `${siteConfig.url}/${lang}/machu-picchu-tickets`,
      images: [{ url: "/images/og-default.jpg", width: 1200, height: 630 }],
    },
  };
}

export default function MachuPicchuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Machu Picchu Tickets & Trains Availability",
    "description": "Check live availability for Machu Picchu Llaqta entrance tickets and trains from Ollantaytambo.",
    "url": `${siteConfig.url}/machu-picchu-tickets`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
