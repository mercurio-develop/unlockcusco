import { TripProvider } from "@/lib/store/trip-context";
import { AiConcierge } from "@/features/concierge/components/ai-concierge";
import { Suspense } from "react";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TripProvider>
      {children}
      <Suspense fallback={null}>
        <AiConcierge />
      </Suspense>
    </TripProvider>
  );
}
