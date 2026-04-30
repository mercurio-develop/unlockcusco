"use client"

import { useState, useRef, MouseEvent } from "react"
import { ArrowRight, Clock } from "lucide-react"

export function ExperienceRow({ packages }: { packages: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  if (packages.length === 0) return null

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const onMouseLeave = () => setIsDragging(false)
  const onMouseUp = () => setIsDragging(false)
  
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <section className="bg-white py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
              Single Days
            </p>
            <h2 className="text-4xl font-[var(--font-display)] text-[var(--primary)] tracking-tight">
              Curated Experiences
            </h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
            Swipe to explore →
          </span>
        </div>

        <div 
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={`flex gap-6 overflow-x-auto pb-12 scrollbar-hide snap-x -mx-6 px-6 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {packages.map((exp) => {
            const gallery = JSON.parse(exp.galleryJson || "[]")
            const mainImage = exp.heroImage || gallery[0]?.url || "/images/og-default.jpg"
            
            return (
              <div 
                key={exp.id} 
                className="flex-none w-[320px] md:w-[400px] snap-start group cursor-pointer"
              >
                <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={mainImage} 
                    alt={exp.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[var(--primary)] via-[var(--primary)]/20 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em]">{exp.durationStr}</span>
                    </div>
                    
                    <h3 className="text-2xl font-[var(--font-display)] font-bold text-white mb-4">
                      {exp.title}
                    </h3>
                    
                    <div className="flex items-center justify-between border-t border-white/20 pt-6">
                      <span className="text-white font-bold text-lg">${exp.basePriceUsd}</span>
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] transition-all duration-300">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
