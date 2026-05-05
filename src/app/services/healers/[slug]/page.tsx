import { notFound } from "next/navigation"
import { getAgencyBySlug } from "@/features/agencies/queries"
import { SanctuaryOnePage } from "@/features/agencies/components/layouts/SanctuaryOnePage"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const healer = await getAgencyBySlug(slug)

  if (!healer) return {}

  return {
    title: healer.seoMetaTitle || healer.name,
    description: healer.seoMetaDesc || healer.tagline || healer.description,
  }
}

export default async function HealerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const healer = await getAgencyBySlug(slug)

  if (!healer) {
    notFound()
  }

  const theme = JSON.parse(healer.themeConfig || "{}")
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

  return (
    <div className="min-h-screen bg-white" style={style}>
      <link rel="stylesheet" href={fontUrl} />
      
      <main>
        <SanctuaryOnePage business={healer} />
      </main>
    </div>
  )
}
