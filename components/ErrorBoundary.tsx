'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorId: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Log error to PostHog
    try {
      posthog.capture('$exception', {
        $exception_type: error.name,
        $exception_message: error.message,
        $exception_stack: error.stack,
        $exception_component_stack: errorInfo.componentStack,
        error_id: errorId,
        error_boundary: true,
        timestamp: new Date().toISOString(),
      })
    } catch (postHogError) {
      // Fallback logging if PostHog fails
      console.error('Failed to log error to PostHog:', postHogError)
    }

    this.setState({ errorId })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorId: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Our team has been notified
                and will look into it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.props.showDetails && this.state.error && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Simplified error boundary for specific components
export function SimpleErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
            <p className="text-sm">
              Something went wrong. Please try refreshing the page.
            </p>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Hook for manually reporting errors
export function useErrorHandler() {
  return {
    reportError: (error: Error, context?: Record<string, unknown>) => {
      try {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        posthog.capture('$exception', {
          $exception_type: error.name,
          $exception_message: error.message,
          $exception_stack: error.stack,
          error_id: errorId,
          manual_report: true,
          ...context,
        })
      } catch (postHogError) {
        console.error('Failed to report error to PostHog:', postHogError)
      }
    },

    reportMessage: (
      message: string,
      level: 'info' | 'warning' | 'error' = 'info'
    ) => {
      try {
        posthog.capture('custom_message', {
          message,
          level,
          timestamp: new Date().toISOString(),
        })
      } catch (postHogError) {
        console.error('Failed to report message to PostHog:', postHogError)
      }
    },
  }
}
