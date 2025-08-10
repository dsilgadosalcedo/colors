import { NextRequest, NextResponse } from 'next/server'
import {
  aiServiceLimiter,
  generalApiLimiter,
  addRateLimitHeaders,
} from '@/lib/rate-limiter'
import { API_ERRORS, handleApiError } from '@/lib/api-error-handler'

// Security headers configuration
const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Note: unsafe-inline/eval needed for Next.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Only upgrade insecure requests in production where we have proper SSL certificates
    ...(process.env.NODE_ENV === 'production'
      ? ['upgrade-insecure-requests']
      : []),
  ].join('; '),

  // Security headers
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
  ].join(', '),

  // HSTS (only in production)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
}

// Routes that need rate limiting
const rateLimitedRoutes = {
  '/api/generate': aiServiceLimiter,
  '/api/': generalApiLimiter, // Fallback for all other API routes
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Handle rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      // Find the most specific rate limiter for this route
      const rateLimiter = Object.entries(rateLimitedRoutes)
        .sort(([a], [b]) => b.length - a.length) // Sort by specificity (longer paths first)
        .find(([route]) => request.nextUrl.pathname.startsWith(route))?.[1]

      if (rateLimiter) {
        // Peek without incrementing; actual increment happens in the route handler
        const rateLimitResult = rateLimiter.peek(request)

        // Add rate limit headers
        addRateLimitHeaders(response.headers, rateLimitResult)

        // Block request if rate limit exceeded
        if (!rateLimitResult.success) {
          return handleApiError(API_ERRORS.RATE_LIMITED(), request)
        }
      }
    } catch (error) {
      // Log error but don't block the request
      console.error('Rate limiting error:', error)
    }
  }

  // Additional security checks
  const userAgent = request.headers.get('user-agent') || ''

  // Block suspicious user agents
  const suspiciousUserAgents = [
    'curl',
    'wget',
    'python-requests',
    'python-urllib',
    'bot',
    'crawler',
    'spider',
  ]

  if (
    suspiciousUserAgents.some(agent =>
      userAgent.toLowerCase().includes(agent.toLowerCase())
    )
  ) {
    // Allow in development, block in production
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Prevent access to sensitive files
  const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.production',
    'package.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.git',
    'node_modules',
  ]

  if (sensitiveFiles.some(file => request.nextUrl.pathname.includes(file))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const allowedOrigin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      '*'

    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.NODE_ENV === 'production' ? allowedOrigin : '*'
    )
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
