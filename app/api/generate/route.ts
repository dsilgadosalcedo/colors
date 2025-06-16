import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, API_ERRORS } from '@/lib/api-error-handler'
import { aiServiceLimiter, addRateLimitHeaders } from '@/lib/rate-limiter'
import { validateInput, generatePaletteRequestSchema } from '@/lib/validations'
import { generateColorPalette } from '@/app/actions'

async function generateHandler(req: NextRequest): Promise<NextResponse> {
  // Rate limiting check
  const rateLimitResult = aiServiceLimiter.check(req)
  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait before trying again.',
          retryAfter: rateLimitResult.retryAfter,
        },
      },
      { status: 429 }
    )
    addRateLimitHeaders(response.headers, rateLimitResult)
    return response
  }

  // Validate request body
  const body = await req.json()
  const validation = validateInput(generatePaletteRequestSchema, body)

  if (!validation.success) {
    throw API_ERRORS.VALIDATION_ERROR(validation.errors.join(', '))
  }

  const { imageDataUrl, defaultColorCount, userPrompt, currentPalette } =
    validation.data

  try {
    // Call the AI service to generate palette
    const result = await generateColorPalette(
      imageDataUrl || null,
      defaultColorCount,
      userPrompt,
      currentPalette
    )

    const response = NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })

    // Add rate limit headers to successful responses
    addRateLimitHeaders(response.headers, rateLimitResult)

    return response
  } catch (error) {
    // Enhanced error handling for AI service errors
    if (error instanceof Error) {
      if (error.message.includes('INVALID_REQUEST')) {
        throw API_ERRORS.VALIDATION_ERROR(
          'The request could not be processed. Please check your input.'
        )
      }

      if (
        error.message.includes('quota') ||
        error.message.includes('rate limit')
      ) {
        throw API_ERRORS.AI_SERVICE_ERROR(
          'AI service is temporarily overloaded. Please try again in a few moments.'
        )
      }

      // Generic AI service error
      throw API_ERRORS.AI_SERVICE_ERROR(`AI service error: ${error.message}`)
    }

    throw API_ERRORS.INTERNAL_ERROR(
      'An unexpected error occurred while generating the palette.'
    )
  }
}

// Export the handler with error handling middleware
export const POST = withErrorHandler(generateHandler)

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'color-palette-generator',
    version: process.env.npm_package_version || '1.0.0',
  })
}
