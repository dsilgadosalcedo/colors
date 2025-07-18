// Server-side instrumentation for production monitoring
export async function register() {
  if (process.env.NODE_ENV === 'production') {
    // PostHog initialization for server-side tracking
    console.log('PostHog server-side tracking initialized')
  }
}

// Enhanced error handler for server components
export async function onRequestError(err: unknown, request: any, context: any) {
  try {
    // Import PostHog dynamically for server-side error logging
    const { captureServerEvent } = await import('@/lib/server/posthog')

    // Generate error ID for tracking
    const errorId = `server_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Log the error to PostHog with additional context
    await captureServerEvent('server_error', {
      error_id: errorId,
      error_message: err instanceof Error ? err.message : String(err),
      error_stack: err instanceof Error ? err.stack : undefined,
      url: request?.url,
      method: request?.method,
      user_agent: request?.headers?.['user-agent'],
      context,
    })
  } catch (postHogError) {
    // Fallback logging if PostHog fails
    console.error('Failed to log error to PostHog:', postHogError)
    console.error('Original error:', err)
  }
}
