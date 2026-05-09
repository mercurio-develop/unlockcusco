import { Suspense } from "react"
import { BuilderProvider } from "@/features/pro-builder/store/builder-context"
import { ProBuilderMain } from "@/features/pro-builder/components/ProBuilderMain"

export default function AgencyTripBuilderPage() {
  return (
    <BuilderProvider>
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <ProBuilderMain />
      </Suspense>
    </BuilderProvider>
  )
}
