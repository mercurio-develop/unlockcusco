import type { Metadata } from "next";
import { GuidesIndexView } from "@/features/guides";
import { parseLocale } from "@/paths";

export const metadata: Metadata = {
  title: "Travel Guides & Itineraries for Cusco & Sacred Valley",
  description:
    "Read expert guides, logistics, and itineraries for planning the perfect trip to Cusco, the Sacred Valley, and Machu Picchu.",
};

export default async function GuidesIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <GuidesIndexView lang={parseLocale(lang)} />;
}
