import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

// In-memory store for rate limiting (use Redis in production)
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  get(key: string): { count: number; resetTime: number } | undefined {
    const data = this.store.get(key)
    if (data && Date.now() > data.resetTime) {
      this.store.delete(key)
      return undefined
    }
    return data
  }

  set(key: string, count: number, resetTime: number): void {
    this.store.set(key, { count, resetTime })
  }

  increment(
    key: string,
    windowMs: number
  ): { count: number; resetTime: number } {
    const now = Date.now()
    const existing = this.get(key)

    if (existing) {
      existing.count++
      this.set(key, existing.count, existing.resetTime)
      return existing
    } else {
      const resetTime = now + windowMs
      this.set(key, 1, resetTime)
      return { count: 1, resetTime }
    }
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

const store = new MemoryStore()

// Cleanup expired entries every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000)

// Default key generator using IP address
function defaultKeyGenerator(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'
  return `rate_limit:${ip}`
}

// Rate limiter function
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator = defaultKeyGenerator } = config

  return {
    check: (req: NextRequest): RateLimitResult => {
      const key = keyGenerator(req)
      const { count, resetTime } = store.increment(key, windowMs)

      const success = count <= maxRequests
      const remaining = Math.max(0, maxRequests - count)
      const retryAfter = success
        ? undefined
        : Math.ceil((resetTime - Date.now()) / 1000)

      return {
        success,
        limit: maxRequests,
        remaining,
        resetTime,
        retryAfter,
      }
    },

    // Method to manually increment counter (for post-processing)
    increment: (req: NextRequest): void => {
      const key = keyGenerator(req)
      store.increment(key, windowMs)
    },

    // Method to check without incrementing
    peek: (req: NextRequest): RateLimitResult => {
      const key = keyGenerator(req)
      const existing = store.get(key)

      if (!existing) {
        return {
          success: true,
          limit: maxRequests,
          remaining: maxRequests,
          resetTime: Date.now() + windowMs,
        }
      }

      const success = existing.count < maxRequests
      const remaining = Math.max(0, maxRequests - existing.count)
      const retryAfter = success
        ? undefined
        : Math.ceil((existing.resetTime - Date.now()) / 1000)

      return {
        success,
        limit: maxRequests,
        remaining,
        resetTime: existing.resetTime,
        retryAfter,
      }
    },
  }
}

// Predefined rate limiters for different endpoints
export const aiServiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  keyGenerator: req => {
    // Consider user session if available, otherwise use IP
    const sessionId = req.headers.get('x-session-id')
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown'
    return `ai_service:${sessionId || ip}`
  },
})

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
})

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
})

// Middleware helper for Next.js API routes
export function withRateLimit(limiter: ReturnType<typeof rateLimit>) {
  return function rateLimitMiddleware(req: NextRequest): RateLimitResult {
    return limiter.check(req)
  }
}

// Utility to add rate limit headers to response
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', result.resetTime.toString())

  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString())
  }
}
