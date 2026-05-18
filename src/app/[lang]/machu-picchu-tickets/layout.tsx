import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Machu Picchu Tickets & Trains Availability | VALLECITO",
  description: "Check live availability for Machu Picchu Llaqta entrance tickets and trains from Ollantaytambo. Official tickets, no markups.",
  alternates: {
    canonical: `${siteConfig.url}/machu-picchu-tickets`,
  },
  openGraph: {
    title: "Machu Picchu Tickets & Trains Availability",
    description: "Check live availability for Machu Picchu Llaqta entrance tickets and trains from Ollantaytambo.",
    url: `${siteConfig.url}/machu-picchu-tickets`,
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630 }],
  },
};

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
