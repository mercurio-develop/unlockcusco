import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import PostHogPageView from "@/components/providers/posthog-pageview";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getDictionary, Locale } from "@/lib/dictionaries";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { createClient } from "@/lib/supabase/server";

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
    template: "%s | UNLOCKCUSCO",
    default: "UNLOCKCUSCO | Cusco, Sacred Valley & Machu Picchu Itinerary Guide",
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: "UNLOCKCUSCO | Cusco, Sacred Valley & Machu Picchu Itinerary Guide",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "UNLOCKCUSCO",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "UnlockCusco Sacred Valley",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UNLOCKCUSCO | Cusco, Sacred Valley & Machu Picchu Itinerary Guide",
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

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang as Locale);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const {
    children
  } = props;

  return (
    <html
      lang={params.lang}
      className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <PostHogProvider>
          <NuqsAdapter>
            <PostHogPageView />
            <Navbar dict={dict.navbar} user={user} />
            <main className="flex-1 flex flex-col pt-12 bg-white">
              {children}
            </main>
          </NuqsAdapter>
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
