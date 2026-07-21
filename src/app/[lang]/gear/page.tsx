import type { Metadata } from "next";
import { GearHubView } from "@/features/gear";
import { parseLocale } from "@/paths";

export const metadata: Metadata = {
  title: "Essential Gear & Stays for Peru",
  description:
    "Curated packing lists, top-rated gear, and the best places to stay for your trip to Cusco, the Sacred Valley, and Machu Picchu.",
};

export default async function GearHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <GearHubView lang={parseLocale(lang)} />;
}
