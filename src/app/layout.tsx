import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { TripProvider } from "@/lib/store/trip-context";
import { AiConcierge } from "@/features/concierge/components/ai-concierge";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import PostHogPageView from "@/components/providers/posthog-pageview";

import { siteConfig } from "@/lib/config/site";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | VALLECITO",
    default: "VALLECITO | Sacred Valley Discoveries",
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: "VALLECITO | Sacred Valley Discoveries",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "VALLECITO",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Vallecito Sacred Valley",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VALLECITO | Sacred Valley Discoveries",
    description: siteConfig.description,
    images: ["/images/og-default.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090B] text-white font-sans">
        <PostHogProvider>
          <PostHogPageView />
          <TripProvider>
            <Navbar />
            <main className="flex-1 flex flex-col pt-14 bg-white">
              {children}
            </main>
            <Suspense fallback={null}>
              <AiConcierge />
            </Suspense>
          </TripProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
