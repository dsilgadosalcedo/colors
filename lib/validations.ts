import { z } from 'zod'

// Base validation schemas
export const emailSchema = z.string().email('Invalid email address')

export const urlSchema = z.string().url('Invalid URL format')

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')

export const colorNameSchema = z
  .string()
  .min(1, 'Color name is required')
  .max(50, 'Color name is too long')
  .regex(/^[a-zA-Z0-9\s-_]+$/, 'Invalid characters in color name')

// Image validation schemas
export const imageDataUrlSchema = z
  .string()
  .refine(
    data => {
      // Check if it's a valid data URL for images
      const dataUrlRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/
      return dataUrlRegex.test(data)
    },
    {
      message: 'Invalid image data URL format',
    }
  )
  .refine(
    data => {
      // Check file size (limit to 10MB)
      const base64Data = data.split(',')[1]
      if (!base64Data) return false

      const sizeInBytes = (base64Data.length * 3) / 4
      const maxSize = 10 * 1024 * 1024 // 10MB
      return sizeInBytes <= maxSize
    },
    {
      message: 'Image size exceeds 10MB limit',
    }
  )

// Color palette validation schemas
export const colorSchema = z.object({
  hex: hexColorSchema,
  name: colorNameSchema,
  description: z
    .string()
    .min(1, 'Color description is required')
    .max(200, 'Color description is too long'),
})

export const paletteSchema = z.object({
  colors: z
    .array(colorSchema)
    .min(1, 'At least one color is required')
    .max(10, 'Maximum 10 colors allowed'),
  dominantColor: hexColorSchema,
  mood: z
    .string()
    .min(1, 'Mood description is required')
    .max(100, 'Mood description is too long'),
})

// AI prompt validation
export const promptSchema = z
  .string()
  .min(1, 'Prompt is required')
  .max(500, 'Prompt is too long')
  .refine(
    prompt => {
      // Basic content filtering - no malicious prompts
      const maliciousPatterns = [
        /ignore.*previous.*instructions/i,
        /system.*prompt/i,
        /forget.*everything/i,
        /<script/i,
        /javascript:/i,
        /eval\(/i,
      ]

      return !maliciousPatterns.some(pattern => pattern.test(prompt))
    },
    {
      message: 'Invalid prompt content',
    }
  )

// API request validation schemas
export const generatePaletteRequestSchema = z.object({
  imageDataUrl: imageDataUrlSchema.optional(),
  defaultColorCount: z
    .number()
    .int()
    .min(1, 'Color count must be at least 1')
    .max(10, 'Color count cannot exceed 10')
    .default(3),
  userPrompt: promptSchema.optional(),
  currentPalette: paletteSchema.optional(),
})

// Environment variable validation
export const envSchema = z.object({
  GOOGLE_GENERATIVE_AI_API_KEY: z
    .string()
    .min(1, 'Google AI API key is required'),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1, 'PostHog API key is required'),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string()
    .url()
    .min(1, 'PostHog host URL is required'),
  POSTHOG_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
})

// User input sanitization
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .substring(0, 1000) // Limit length
}

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().max(255, 'Filename too long'),
  size: z.number().max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
  type: z.enum(
    ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    {
      errorMap: () => ({
        message:
          'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      }),
    }
  ),
})

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  sessionId: z.string().uuid().optional(),
})

// Security headers validation
export const securityHeadersSchema = z.object({
  'content-security-policy': z.string().optional(),
  'x-frame-options': z.enum(['DENY', 'SAMEORIGIN']).optional(),
  'x-content-type-options': z.literal('nosniff').optional(),
  'referrer-policy': z
    .enum([
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url',
    ])
    .optional(),
  'permissions-policy': z.string().optional(),
})

// Validation helper functions
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
      })
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
    }
    throw error
  }
}

// Request validation middleware
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateInput(schema, data)
    if (!result.success) {
      throw new Error(`Validation failed: ${result.errors.join(', ')}`)
    }
    return result.data
  }
}
