import { notFound } from "next/navigation"
import { getAgencyBySlug } from "@/features/agencies/queries"
import { AgencyHero } from "@/features/agencies/components/AgencyHero"
import { AgencyAbout } from "@/features/agencies/components/AgencyAbout"
import { PackageGrid } from "@/features/agencies/components/PackageGrid"
import { ExperienceRow } from "@/features/agencies/components/ExperienceRow"
import { AvailabilityForm } from "@/features/agencies/components/AvailabilityForm"
import { Navbar } from "@/components/layout/navbar"

export default async function AgencyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const agency = await getAgencyBySlug(slug)

  if (!agency) {
    notFound()
  }

  const theme = JSON.parse(agency.themeConfig || "{}")
  const style = {
    '--primary': theme.primary || '#0E0E0E',
    '--primary-alt': theme.primaryAlt || '#121212',
    '--accent': theme.accent || '#C9A24D',
    '--accent-alt': theme.accentAlt || '#D4AF37',
    '--accent-hover': theme.accentHover || '#B8923D',
    '--support': theme.support || '#2A2A2A',
    '--muted': theme.muted || '#9CA3AF',
    '--font-display': theme.fontDisplay || 'Playfair Display',
    '--font-body': theme.fontBody || 'Inter',
  } as React.CSSProperties

  // Group packages by type (simplified logic for now)
  const treks = agency.tourPackages.filter(p => p.durationDays > 1)
  const experiences = agency.tourPackages.filter(p => p.durationDays <= 1)

  return (
    <div className="min-h-screen bg-white" style={style}>
      <Navbar />
      
      <main>
        <AgencyHero agency={agency} />
        <AgencyAbout agency={agency} />
        <PackageGrid packages={treks} />
        <ExperienceRow packages={experiences} />
        <AvailabilityForm 
          agencyId={agency.id}
          agencyName={agency.name} 
          whatsapp={agency.contactPhone}
          packages={agency.tourPackages}
        />
      </main>
    </div>
  )
}
