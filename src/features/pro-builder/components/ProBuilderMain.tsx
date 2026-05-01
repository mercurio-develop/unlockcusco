"use client"

import { useBuilder } from "@/features/pro-builder/store/builder-context"
import { BuilderWizard } from "./BuilderWizard"
import { BuilderWorkspace } from "./BuilderWorkspace"
import { CheckoutDetailsForm } from "./CheckoutDetailsForm"

export function ProBuilderMain() {
  const { viewState } = useBuilder()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[600px] flex overflow-hidden">
        {viewState === 'wizard' && <BuilderWizard />}
        {viewState === 'workspace' && <BuilderWorkspace />}
        {viewState === 'checkout' && <CheckoutDetailsForm />}
      </div>
    </div>
  )
}
