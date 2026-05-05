import { getAgencyBySlug } from "@/features/agencies/queries"
import type { Metadata } from "next"

interface AgencyLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: AgencyLayoutProps): Promise<Metadata> {
  const { slug } = await params
  const agency = await getAgencyBySlug(slug)

  if (!agency) {
    return { title: 'Business Not Found | Vallecito' }
  }

  const title = `${agency.name} | Partner Business`
  const description = agency.tagline || agency.description

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: agency.imageUrl || "/images/og-default.jpg",
          width: 1200,
          height: 630,
          alt: agency.name,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [agency.imageUrl || "/images/og-default.jpg"],
    },
  }
}

export default function AgencyLayout({ children }: AgencyLayoutProps) {
  return <>{children}</>
}
