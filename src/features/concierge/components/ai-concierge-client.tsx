"use client";

import dynamic from "next/dynamic";

export const AiConciergeClient = dynamic(
  () => import("./ai-concierge").then((mod) => mod.AiConcierge),
  { ssr: false }
);
