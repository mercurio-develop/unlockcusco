"use client"

import {useState, useEffect, useCallback} from "react"
import {useRouter} from "next/navigation"
import {motion} from "framer-motion"
import {ArrowRight, Loader2} from "lucide-react"
import {useInView} from "react-intersection-observer"
import {fetchBusinesses} from "@/features/discovery/actions/fetch-businesses"
import {BusinessCard} from "@/features/discovery/components/business-card"
import type { Business } from "@prisma/client"

const CATEGORIES = ["All", "Adventure", "Wellness", "Dining", "Culture", "Stays"]

interface BusinessGridProps {
  initialBusinesses: Business[]
  initialHasMore: boolean
}

export function BusinessGrid({initialBusinesses, initialHasMore}: BusinessGridProps) {
  const [active, setActive] = useState("All")
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const {ref, inView} = useInView()

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const nextPage = page + 1
    const categoryFilter = active === "All" ? "" : active
    
    try {
      const res = await fetchBusinesses({ category: categoryFilter, page: nextPage, limit: 20 })
      setBusinesses(prev => [...prev, ...res.businesses])
      setPage(nextPage)
      setHasMore(res.hasMore)
    } catch (error) {
      console.error("Failed to fetch more businesses:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, hasMore, isLoading, active])

  useEffect(() => {
    if (inView) {
       
      loadMore()
    }
  }, [inView, loadMore])

  const handleCategoryChange = async (cat: string) => {
    if (cat === active) return
    setActive(cat)
    setIsLoading(true)
    setPage(0)
    try {
      const res = await fetchBusinesses({ category: cat === "All" ? "" : cat, page: 0, limit: 20 })
      setBusinesses(res.businesses)
      setHasMore(res.hasMore)
    } catch (error) {
      console.error("Failed to fetch businesses by category:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="discover-grid" className="bg-white px-6 md:px-12 py-20">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-3 font-semibold">Sacred Valley</p>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
            Places waiting for you.
          </h2>
        </div>
        <button
          onClick={() => router.push("/explore")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors text-sm group"
        >
          See all on map
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            disabled={isLoading && active !== cat}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
              active === cat
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            } ${isLoading && active !== cat ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        key={active}
        initial="hidden"
        animate="visible"
        variants={{visible: {transition: {staggerChildren: 0.07}}}}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
      >
        {businesses.map((business, i) => (
          <motion.div
            key={`${business.id}-${i}`}
            variants={{
              hidden: {opacity: 0, y: 24},
              visible: {opacity: 1, y: 0, transition: {duration: 0.4}},
            }}
          >
            <BusinessCard
              business={business}
              onSelect={() => router.push(`/explore?id=${business.id}`)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="mt-12 flex justify-center h-16 items-center">
        {isLoading && <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center flex flex-col items-center gap-6">
        <button
          onClick={() => router.push("/explore")}
          className="inline-flex items-center gap-3 bg-white border border-gray-200 text-slate-900 px-8 py-4 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
        >
          Open the full map
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  )
}
