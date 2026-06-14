import React from "react"
import { Business } from "@prisma/client"
import { BusinessCard } from "@/features/discovery/components/business-card"
import { ScrollCarousel } from "@/components/ui/scroll-carousel"

interface ComparableExperiencesProps {
  experiences: Business[]
  isEs: boolean
  dict: any
}

export function ComparableExperiences({ experiences, isEs, dict }: ComparableExperiencesProps) {
  if (!experiences || experiences.length === 0) return null

  return (
    <div className="lg:max-w-6xl lg:mx-auto lg:px-6 pt-4 pb-12">
      <section className="px-4 lg:px-0 py-8 border-t border-slate-200/60">
        <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">
          {isEs ? 'Experiencias Similares Cercanas' : 'Nearby Similar Experiences'}
        </h2>
        <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0 items-stretch">
          {experiences.map((exp) => (
            <div key={exp.id} className="w-[280px] lg:w-[320px] flex-shrink-0 flex flex-col">
              <BusinessCard
                business={exp}
                orientation="vertical"
                showItineraryAdd={true}
                dict={dict}
              />
            </div>
          ))}
        </ScrollCarousel>
      </section>
    </div>
  )
}
