"use client"

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
      // Check if already initialized to avoid "You have already initialized PostHog!" warning
      if (typeof window !== 'undefined' && !posthog.has_opted_out_capturing()) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'ph_dummy_key', {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false, // Handled manually below
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') posthog.debug(false)
          }
        })
      }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
