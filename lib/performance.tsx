'use client'

import React, { lazy, Suspense, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy loading wrapper with loading states
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent?: ComponentType
) {
  const LazyComponent = lazy(importFn)

  return function LazyWrapper(props: React.ComponentProps<T>) {
    const Loading = LoadingComponent || DefaultLoading

    return (
      <Suspense fallback={<Loading />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Default loading components for different sizes
export const DefaultLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

export const CardLoading = () => (
  <div className="space-y-3">
    <Skeleton className="h-[200px] w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>
)

export const PaletteLoading = () => (
  <div className="grid grid-cols-5 gap-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-md" />
    ))}
  </div>
)

// Lazy loaded components
export const LazySavedPalettes = createLazyComponent(
  () =>
    import('@/components/SavedPalettes').then(m => ({
      default: m.SavedPalettes,
    })),
  CardLoading
)

export const LazyPaletteCard = createLazyComponent(
  () =>
    import('@/components/PaletteCard').then(m => ({ default: m.PaletteCard })),
  CardLoading
)

// Performance monitoring hooks
export function usePerformanceObserver() {
  if (typeof window === 'undefined') return

  // Observer for tracking long tasks
  if ('PerformanceObserver' in window) {
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
    } catch {
      // Some browsers might not support longtask
      console.log('Long task monitoring not supported')
    }
  }
}

// Image optimization helpers
export function getOptimizedImageProps(src: string, alt: string) {
  return {
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    style: { contentVisibility: 'auto' },
  }
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  const ref = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => callback(entry.isIntersecting),
      { threshold: 0.1, ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [callback, options])

  return ref
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'font'
  link.type = 'font/woff2'
  link.crossOrigin = 'anonymous'
  link.href = '/fonts/geist-sans.woff2'
  document.head.appendChild(link)
}

// Bundle size monitoring (development only)
export function logBundleSize() {
  if (process.env.NODE_ENV !== 'development') return

  // This will help track bundle size in development
  const script = document.createElement('script')
  script.innerHTML = `
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const entries = performance.getEntriesByType('resource');
      let totalSize = 0;
      
      entries.forEach(entry => {
        if (entry.name.includes('_next/static')) {
          totalSize += entry.transferSize || 0;
        }
      });
      
      console.log('📦 Estimated bundle size:', Math.round(totalSize / 1024), 'KB');
    }
  `
  document.head.appendChild(script)
}
