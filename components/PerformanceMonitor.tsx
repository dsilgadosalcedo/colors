'use client'

import { useEffect } from 'react'
import { initWebVitals, trackEvent } from '@/lib/analytics'
import { logBundleSize, preloadCriticalResources } from '@/lib/performance'

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals tracking
    initWebVitals()

    // Preload critical resources
    preloadCriticalResources()

    // Start performance monitoring
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          // Log long tasks that might impact user experience
          if (entry.duration > 50) {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            })
          }
        })
      })

      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // Some browsers might not support longtask
        console.log('Long task monitoring not supported')
      }
    }

    // Log bundle size in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(logBundleSize, 2000)
    }

    // Track app initialization
    trackEvent('app_initialized', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    })

    // Track page visibility changes
    const handleVisibilityChange = () => {
      trackEvent('visibility_change', {
        hidden: document.hidden,
        timestamp: Date.now(),
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Track unload for session duration
    const sessionStart = Date.now()
    const handleBeforeUnload = () => {
      trackEvent('session_end', {
        duration: Date.now() - sessionStart,
        timestamp: Date.now(),
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null // This component doesn't render anything
}
