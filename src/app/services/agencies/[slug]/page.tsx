import { notFound } from "next/navigation"
import { getAgencyBySlug } from "@/features/agencies/queries"
import { Navbar } from "@/components/layout/navbar"
import { ExpeditionOnePage } from "@/components/agencies/layouts/ExpeditionOnePage"
import { SanctuaryOnePage } from "@/components/agencies/layouts/SanctuaryOnePage"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const agency = await getAgencyBySlug(slug)

  if (!agency) return {}

  return {
    title: agency.seoMetaTitle || agency.name,
    description: agency.seoMetaDesc || agency.tagline || agency.description,
  }
}

export default async function AgencyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const agency = await getAgencyBySlug(slug)

  if (!agency) {
    notFound()
  }

  const theme = JSON.parse(agency.themeConfig || "{}")
  const fontDisplay = theme.fontDisplay || 'Playfair Display'
  const fontBody = theme.fontBody || 'Inter'

  const style = {
    '--primary': theme.primary || '#0E0E0E',
    '--primary-alt': theme.primaryAlt || '#121212',
    '--accent': theme.accent || '#C9A24D',
    '--accent-alt': theme.accentAlt || '#D4AF37',
    '--accent-hover': theme.accentHover || '#B8923D',
    '--support': theme.support || '#2A2A2A',
    '--muted': theme.muted || '#9CA3AF',
    '--font-display': `"${fontDisplay}", serif`,
    '--font-body': `"${fontBody}", sans-serif`,
  } as React.CSSProperties

  const fontDisplayUrl = fontDisplay.replace(/\s+/g, '+')
  const fontBodyUrl = fontBody.replace(/\s+/g, '+')
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontBodyUrl}:wght@300;400;500;600;700&family=${fontDisplayUrl}:wght@400;500;600;700&display=swap`

  const isSanctuary = agency.category === "therapist" || agency.category === "sanctuary"

  return (
    <div className="min-h-screen bg-white" style={style}>
      <link rel="stylesheet" href={fontUrl} />
      
      <main>
        {isSanctuary ? (
          <SanctuaryOnePage agency={agency} />
        ) : (
          <ExpeditionOnePage agency={agency} />
        )}
      </main>
    </div>
  )
}
