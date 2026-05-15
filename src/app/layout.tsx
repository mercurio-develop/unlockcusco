import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { PreferencesProvider } from "@/lib/store/preferences-context";
import { AiConcierge } from "@/features/concierge";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import PostHogPageView from "@/components/providers/posthog-pageview";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <PostHogProvider>
          <PostHogPageView />
          <PreferencesProvider>
            <Navbar />
            <main className="flex-1 flex flex-col pt-14 bg-white">
              {children}
            </main>
          </PreferencesProvider>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
