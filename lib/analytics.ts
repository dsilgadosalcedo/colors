import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

// Web Vitals tracking function
export function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric)
  }

  // Send to analytics service
  const url = '/api/analytics'

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  const body = JSON.stringify(metric)

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else {
    fetch(url, { body, method: 'POST', keepalive: true })
  }
}

// Initialize Web Vitals tracking
export function initWebVitals() {
  onCLS(sendToAnalytics)
  onINP(sendToAnalytics) // INP replaces FID in web-vitals v5
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}

// Performance budget thresholds
export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals thresholds (good/needs improvement/poor)
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (replaces FID)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte

  // Bundle size budgets
  BUNDLE: {
    initial: 1000000, // 1MB
    total: 2000000, // 2MB
  },
}

// Performance monitoring helper
export function checkPerformanceBudget(
  metric: Metric
): 'good' | 'needs-improvement' | 'poor' {
  const budget =
    PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS]

  if (!budget || typeof budget !== 'object' || !('good' in budget)) {
    return 'good'
  }

  if (metric.value <= budget.good) return 'good'
  if (metric.value <= budget.poor) return 'needs-improvement'
  return 'poor'
}

// Analytics components export
export { Analytics as VercelAnalytics, SpeedInsights as VercelSpeedInsights }

// Custom event tracking

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && (window as { va?: unknown }).va) {
    // Use proper typing for Vercel Analytics
    ;(
      window as {
        va?: (
          action: string,
          event: string,
          data?: Record<string, unknown>
        ) => void
      }
    ).va?.('track', eventName, properties)
  }
}

// Track color palette generations
export const trackColorPaletteGeneration = (
  method: 'image' | 'text',
  colorsCount: number
) => {
  trackEvent('color_palette_generated', {
    method,
    colors_count: colorsCount,
    timestamp: Date.now(),
  })
}

// Track palette exports
export const trackPaletteExport = (format: string, colorsCount: number) => {
  trackEvent('palette_exported', {
    format,
    colors_count: colorsCount,
    timestamp: Date.now(),
  })
}
