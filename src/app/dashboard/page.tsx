import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Building2, Settings, MessageSquare, PieChart } from "lucide-react"
import { LeadCTA } from "@/components/dashboard/lead-cta"

interface DashboardPageProps {
  searchParams: Promise<{ businessId?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { businessId } = await searchParams

  const business = businessId
    ? await prisma.business.findUnique({ where: { id: businessId }, include: { leads: true } })
    : await prisma.business.findFirst({ where: { isClaimed: true }, include: { leads: true } })

  const profileViews = business?.viewsCount ?? 0

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-sans">
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r border-slate-200 bg-white p-4 hidden md:block">
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium">
              <PieChart className="w-5 h-5" />
              Overview
            </Link>
            <Link href="/explore" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <MessageSquare className="w-5 h-5" />
              Leads & Messages
            </Link>
            {business && (
              <Link href={`/claim/${business.id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <Building2 className="w-5 h-5" />
                My Profile
              </Link>
            )}
            <Link href="/explore" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {business ? `Welcome, ${business.name}!` : "Welcome to your Dashboard!"}
            </h1>
            <p className="text-slate-600 mb-8 text-lg">Your profile is now visible and you are ready to receive tourists from all around the world.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 font-medium text-sm">Profile Views</h3>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{profileViews}</p>
                <div className="text-green-600 text-xs font-medium mt-2 bg-green-50 w-max px-2 py-1 rounded-md">+12% this week</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 font-medium text-sm">WhatsApp Clicks</h3>
                <p className="text-3xl font-extrabold text-indigo-600 mt-2">{business?.whatsappClicksCount ?? 0}</p>
                <div className="text-slate-500 text-xs font-medium mt-2 bg-slate-50 w-max px-2 py-1 rounded-md">
                  High Intent
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 font-medium text-sm">AI Recommend</h3>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{business?.aiRecommendationsCount ?? 0}</p>
                <div className="text-slate-500 text-xs font-medium mt-2 bg-slate-50 w-max px-2 py-1 rounded-md">
                  In itineraries
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 font-medium text-sm">Total Leads</h3>
                <p className="text-3xl font-extrabold text-indigo-600 mt-2">{business?.leads?.length ?? 0}</p>
                <div className="text-slate-500 text-xs font-medium mt-2 bg-slate-50 w-max px-2 py-1 rounded-md">
                  Collected
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <h2 className="text-2xl font-bold mb-2">Unlock your First Lead</h2>
              <p className="text-indigo-100 mb-6 max-w-xl">
                International tourist &quot;Sarah J.&quot; attempted to book a few minutes ago. Now that your profile is active, you can see her details and contact her directly to close the sale.
              </p>
              <LeadCTA
                businessName={business?.name ?? "your business"}
                businessWhatsapp={business?.whatsapp}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
