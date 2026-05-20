import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage(props: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await props.params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Fetch local user data
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      savedItineraries: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full">
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Welcome back, {dbUser?.firstName || 'Traveler'}
          </h1>
          <p className="text-slate-500 font-medium">Manage your saved itineraries and upcoming bookings.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest text-[11px]">Your Itineraries</h2>
          
          {dbUser?.savedItineraries.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center space-y-4">
              <p className="text-slate-500 font-medium">You haven't saved any itineraries yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbUser?.savedItineraries.map(itin => (
                <div key={itin.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-bold text-slate-900 mb-2">Trip {itin.shortId}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-4">
                    Saved on {new Date(itin.createdAt).toLocaleDateString()}
                  </p>
                  <div className="text-rose-600 text-xs font-bold uppercase tracking-wider">
                    View Details &rarr;
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
