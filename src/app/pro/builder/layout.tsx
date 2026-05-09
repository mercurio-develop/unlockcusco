import { TripProvider } from "@/lib/store/trip-context";

export default function ProBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TripProvider>
      {children}
    </TripProvider>
  );
}
