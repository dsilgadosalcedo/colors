'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Generate error ID for tracking
    const errorId = `global_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Log the error to PostHog
    try {
      posthog.capture('$exception', {
        $exception_type: error.name,
        $exception_message: error.message,
        $exception_stack: error.stack,
        error_id: errorId,
        digest: error.digest,
        global_error: true,
        timestamp: new Date().toISOString(),
      })
    } catch (postHogError) {
      console.error('Failed to log global error to PostHog:', postHogError)
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error)
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">
              Something went wrong!
            </h2>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Our team has been notified.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
