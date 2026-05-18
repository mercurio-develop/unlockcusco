import Link from 'next/link'
import { Map, ArrowRight, Compass } from 'lucide-react'
import { explorePath } from '@/paths'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <div className="p-4 bg-rose-100 rounded-full">
            <Map className="w-12 h-12 text-rose-600" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900">
            Lost in the Valley?
          </h1>
          <p className="text-lg text-slate-600">
            We couldn&apos;t find the page you were looking for. It might have been moved or is currently under construction.
          </p>
        </div>

        <div className="pt-6">
          <Link href={explorePath()}>
            <Button size="lg" className="w-full sm:w-auto gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full">
              <Compass className="w-4 h-4" />
              Return to Explore
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
