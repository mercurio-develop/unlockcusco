import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { ItineraryProvider } from "@/lib/store/itinerary-context";
import { AiConcierge } from "@/components/chat/ai-concierge";
import { Suspense } from "react";

const fontSans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INKAPORTAL | Sacred Valley Discoveries",
  description: "Curated experiences and local businesses in the Sacred Valley.",
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
        <ItineraryProvider>
          <Navbar />
          <main className="flex-1 flex flex-col pt-14">
            {children}
          </main>
          <Suspense fallback={null}>
            <AiConcierge />
          </Suspense>
        </ItineraryProvider>
      </body>
    </html>
  );
}
