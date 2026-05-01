import { BuilderProvider } from "@/features/pro-builder/store/builder-context"
import { ProBuilderMain } from "@/features/pro-builder/components/ProBuilderMain"

export default function AgencyTripBuilderPage() {
  return (
    <BuilderProvider>
      <ProBuilderMain />
    </BuilderProvider>
  )
}
