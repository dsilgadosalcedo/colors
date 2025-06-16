import { NextRequest, NextResponse } from 'next/server'
import { captureServerEvent } from '@/lib/server/posthog'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
  retryable?: boolean
}

export class ApiErrorClass extends Error implements ApiError {
  statusCode: number
  code: string
  retryable: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    retryable: boolean = false
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.retryable = retryable

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiErrorClass.prototype)
  }
}

// Predefined error types for common scenarios
export const API_ERRORS = {
  VALIDATION_ERROR: (message: string) =>
    new ApiErrorClass(message, 400, 'VALIDATION_ERROR', false),

  UNAUTHORIZED: (message: string = 'Unauthorized') =>
    new ApiErrorClass(message, 401, 'UNAUTHORIZED', false),

  FORBIDDEN: (message: string = 'Forbidden') =>
    new ApiErrorClass(message, 403, 'FORBIDDEN', false),

  NOT_FOUND: (message: string = 'Resource not found') =>
    new ApiErrorClass(message, 404, 'NOT_FOUND', false),

  RATE_LIMITED: (message: string = 'Rate limit exceeded') =>
    new ApiErrorClass(message, 429, 'RATE_LIMITED', true),

  AI_SERVICE_ERROR: (message: string = 'AI service temporarily unavailable') =>
    new ApiErrorClass(message, 503, 'AI_SERVICE_ERROR', true),

  TIMEOUT_ERROR: (message: string = 'Request timeout') =>
    new ApiErrorClass(message, 408, 'TIMEOUT_ERROR', true),

  INTERNAL_ERROR: (message: string = 'Internal server error') =>
    new ApiErrorClass(message, 500, 'INTERNAL_ERROR', false),
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
}

// Calculate delay with exponential backoff
function calculateRetryDelay(attempt: number): number {
  const delay =
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelay)
}

// Retry wrapper for async functions
export async function withRetry<T>(
  operation: () => Promise<T>,
  isRetryableError: (error: any) => boolean = error => error.retryable === true,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry on the last attempt or if error is not retryable
      if (attempt === maxRetries || !isRetryableError(error)) {
        break
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt)
      await new Promise(resolve => setTimeout(resolve, delay))

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Retrying operation (attempt ${attempt + 2}/${maxRetries + 1}) after ${delay}ms delay`
        )
      }
    }
  }

  throw lastError
}

// Enhanced error handler with PostHog logging
export async function handleApiError(
  error: unknown,
  request?: NextRequest,
  context?: Record<string, any>
): Promise<NextResponse> {
  let apiError: ApiError

  // Normalize error to ApiError
  if (error instanceof ApiErrorClass) {
    apiError = error
  } else if (error instanceof Error) {
    // Map common error types
    if (error.message.includes('timeout')) {
      apiError = API_ERRORS.TIMEOUT_ERROR(error.message)
    } else if (error.message.includes('rate limit')) {
      apiError = API_ERRORS.RATE_LIMITED(error.message)
    } else {
      apiError = API_ERRORS.INTERNAL_ERROR(error.message)
    }
  } else {
    apiError = API_ERRORS.INTERNAL_ERROR('Unknown error occurred')
  }

  // Generate error ID for tracking
  const errorId = `api_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Log error to PostHog (only for 5xx errors or retryable errors)
  if ((apiError.statusCode ?? 500) >= 500 || apiError.retryable) {
    try {
      await captureServerEvent('api_error', {
        error_id: errorId,
        error_code: apiError.code,
        error_message: apiError.message,
        status_code: apiError.statusCode,
        retryable: apiError.retryable,
        url: request?.url,
        method: request?.method,
        user_agent: request?.headers.get('user-agent'),
        context,
      })
    } catch (postHogError) {
      // Fallback logging if PostHog fails
      console.error('Failed to log API error to PostHog:', postHogError)
    }
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      errorId,
      code: apiError.code,
      message: apiError.message,
      statusCode: apiError.statusCode,
      retryable: apiError.retryable,
      stack: apiError.stack,
      url: request?.url,
      method: request?.method,
    })
  }

  // Prepare user-friendly response
  const isDevelopment = process.env.NODE_ENV === 'development'
  const response = {
    error: {
      message: getPublicErrorMessage(apiError),
      code: apiError.code,
      statusCode: apiError.statusCode,
      retryable: apiError.retryable,
      ...(isDevelopment && {
        details: apiError.message,
        errorId,
        stack: apiError.stack,
      }),
    },
  }

  // Add retry headers for retryable errors
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiError.retryable) {
    headers['Retry-After'] = Math.ceil(calculateRetryDelay(0) / 1000).toString()
    headers['X-Retryable'] = 'true'
  }

  return NextResponse.json(response, {
    status: apiError.statusCode,
    headers,
  })
}

// Get user-friendly error messages
function getPublicErrorMessage(error: ApiError): string {
  const publicMessages: Record<string, string> = {
    VALIDATION_ERROR:
      'Invalid input provided. Please check your data and try again.',
    UNAUTHORIZED: 'Authentication required. Please log in and try again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
    AI_SERVICE_ERROR:
      'AI service is temporarily unavailable. Please try again later.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  }

  return (
    publicMessages[error.code ?? 'INTERNAL_ERROR'] ||
    'An unexpected error occurred. Please try again later.'
  )
}

// Utility function to check if an error is retryable
export function isRetryableError(error: any): boolean {
  if (error instanceof ApiErrorClass) {
    return error.retryable
  }

  // Check for common retryable error patterns
  if (error instanceof Error) {
    const retryablePatterns = [
      /timeout/i,
      /rate limit/i,
      /503/,
      /502/,
      /504/,
      /ECONNRESET/,
      /ENOTFOUND/,
      /ECONNREFUSED/,
    ]

    return retryablePatterns.some(
      pattern => pattern.test(error.message) || pattern.test(error.name)
    )
  }

  return false
}

// Middleware wrapper for API routes
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    try {
      return await handler(request)
    } catch (error) {
      return handleApiError(error, request, {
        handler: handler.name,
        timestamp: new Date().toISOString(),
      })
    }
  }
}
