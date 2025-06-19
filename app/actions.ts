'use server'

import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { ColorPalette, ColorInfo } from '@/lib/types'

// Enhanced system prompts for better AI reasoning
const COLOR_THEORY_PROMPT = `
COLOR THEORY & HARMONY PRINCIPLES:
- Apply color wheel relationships: complementary, analogous, triadic, split-complementary, tetradic
- Consider color temperature (warm vs cool) and emotional psychology
- Ensure proper color balance: dominant (60%), secondary (30%), accent (10%)
- Apply contrast principles for visual hierarchy and accessibility
- Consider cultural color meanings and context appropriateness
`

const ACCESSIBILITY_PROMPT = `
ACCESSIBILITY REQUIREMENTS:
- Ensure WCAG 2.1 AA compliance with minimum 4.5:1 contrast ratio for normal text
- Provide AAA compliance (7:1 ratio) when possible for enhanced accessibility
- Consider color blindness: avoid red-green only distinctions, test deuteranopia/protanopia
- Ensure colors work in grayscale/high contrast modes
- Include sufficient tonal variation for users with low vision
`

const CONTEXT_ANALYSIS_PROMPT = `
CONTEXTUAL REASONING PROCESS:
1. ANALYZE the request's intended use case (branding, web design, art, interior, etc.)
2. CONSIDER the target audience and cultural context
3. EVALUATE the emotional/psychological impact needed
4. DETERMINE the appropriate color relationships and harmony rules
5. ASSESS practical constraints (print vs digital, lighting conditions)
6. VALIDATE accessibility and usability requirements
`

const PROFESSIONAL_STANDARDS_PROMPT = `
PROFESSIONAL COLOR STANDARDS:
- Use precise color values with consideration for different color spaces
- Provide colors that work across digital and print media
- Consider brand scalability and versatility
- Ensure colors reproduce consistently across devices
- Account for lighting conditions and environmental factors
`

// Helper function to extract color count from user prompt
function extractColorCountFromPrompt(prompt: string): number | null {
  const matches = prompt.match(/(\d+)\s*colors?/i)
  if (matches) {
    const count = parseInt(matches[1])
    // Clamp between 3 and 10
    return Math.max(3, Math.min(10, count))
  }
  return null
}

// Helper function to check if prompt is requesting a palette
function isPaletteRequest(prompt: string): boolean {
  const paletteKeywords = [
    'palette',
    'colors',
    'color scheme',
    'generate',
    'create',
    'make',
    'show',
    'give me',
    'want',
    'need',
    'design',
    'red',
    'blue',
    'green',
    'yellow',
    'orange',
    'purple',
    'pink',
    'brown',
    'black',
    'white',
    'gray',
    'grey',
    'warm',
    'cool',
    'bright',
    'dark',
    'light',
    'vibrant',
    'pastel',
    'neon',
    'muted',
    'soft',
    'bold',
    'sunset',
    'ocean',
    'forest',
    'autumn',
    'spring',
    'summer',
    'winter',
  ]

  const lowerPrompt = prompt.toLowerCase()
  return paletteKeywords.some(keyword => lowerPrompt.includes(keyword))
}

export async function generateColorPalette(
  imageDataUrl: string | null,
  defaultColorCount = 3,
  userPrompt?: string,
  currentPalette?: ColorPalette // For editing existing palettes
) {
  try {
    // Handle text-only requests (only validate for new palette creation, not editing)
    if (!imageDataUrl && userPrompt && !currentPalette) {
      if (!isPaletteRequest(userPrompt)) {
        throw new Error('INVALID_REQUEST')
      }
    }

    // Extract color count from user prompt if specified
    const promptColorCount = userPrompt
      ? extractColorCountFromPrompt(userPrompt)
      : null
    const colorCount = promptColorCount || defaultColorCount

    // Create dynamic schema based on color count (max 10)
    const actualColorCount = Math.min(colorCount, 10)

    const ColorPaletteSchema = z.object({
      colors: z
        .array(
          z.object({
            hex: z.string().describe('Hex color code starting with #'),
            name: z
              .string()
              .describe(
                'Creative, professional name for the color (2-3 words max)'
              ),
            description: z
              .string()
              .describe(
                "Very brief description (6-9 words max) focusing on the color's key characteristics and feel"
              ),
          })
        )
        .max(10), // Ensure we never get more than 10 colors
      dominantColor: z
        .string()
        .describe('The most prominent hex color in the palette'),
      mood: z
        .string()
        .describe(
          "Concise mood description (15-20 words max) capturing the palette's overall feeling and atmosphere"
        ),
    })

    let messages

    if (currentPalette) {
      // Editing existing palette
      const currentColorsDetailed = currentPalette.colors
        .map(
          (color: ColorInfo, index: number) =>
            `Color ${index + 1}: ${color.name} (${color.hex}) - ${
              color.description
            }`
        )
        .join('\n')

      if (imageDataUrl) {
        // Editing with image reference
        const base64Data = imageDataUrl.split(',')[1]

        messages = [
          {
            role: 'user' as const,
            content: [
              {
                type: 'text' as const,
                text: `PALETTE EDITING TASK

EXISTING PALETTE DATA:
${currentColorsDetailed}

Current Dominant Color: ${currentPalette.dominantColor}
Current Mood: ${currentPalette.mood}

USER REQUEST: "${userPrompt}"

IMAGE REFERENCE: You can reference specific elements, colors, or areas in the provided image (e.g., "add the color of that jacket on the right", "make it match the sky color", "add the color from the flower in the center").

CRITICAL RULES FOR EDITING:
1. PRESERVE EVERYTHING by default - only change what the user specifically requests
2. Keep ALL existing colors EXACTLY the same (hex, name, description) UNLESS the user explicitly asks to change them
3. Keep the current mood description EXACTLY the same UNLESS the user explicitly asks to change it
4. Keep the current dominant color EXACTLY the same UNLESS the user explicitly asks to change it or adds/removes colors that affect dominance

EDITING GUIDELINES:
- If user says "add [color]": Keep all existing colors unchanged, add the new color(s)
- If user says "add the color of [image element]": Keep all existing colors unchanged, extract and add that specific color from the image
- If user says "change [specific color] to [new color]": Only change that specific color, keep everything else
- If user says "change [specific color] to match [image element]": Only change that specific color to match the image element, keep everything else
- If user says "remove [color]": Remove only that color, keep everything else unchanged
- If user says "make it [mood]": Only change the mood description, keep colors unchanged
- If user says "make [color] the dominant": Only change the dominantColor field, keep everything else
- If user says "change/update/improve the descriptions": Rewrite all color descriptions while keeping exact same colors and hex values
- If user says "change/update the mood": Rewrite the mood description while keeping everything else the same
- If user says "change the mood and descriptions": Update both mood and all color descriptions while keeping exact same colors and hex values
- If user says "make it more [adjective]": Adjust descriptions and mood to reflect that quality while keeping same colors
- If user requests general improvements: Keep exact same colors but improve the names, descriptions, and mood

WHEN UPDATING DESCRIPTIONS OR MOOD:
- Apply the same enhanced reasoning principles from the main generation prompts
- Use color theory, accessibility awareness, and professional standards
- Keep descriptions concise (6-9 words for colors, 15-20 words for mood)
- Make descriptions more engaging, professional, and contextually appropriate

RETURN the palette with:
- All existing colors preserved exactly as they are, plus any requested changes
- Original mood and dominant color unless specifically requested to change
- Maximum 10 colors total

Example: If user says "add the color of that red car" and you have 3 existing colors, return those exact 3 colors plus 1 new color extracted from the red car (4 total).`,
              },
              {
                type: 'image' as const,
                image: base64Data,
              },
            ],
          },
        ]
      } else {
        // Editing without image reference
        messages = [
          {
            role: 'user' as const,
            content: [
              {
                type: 'text' as const,
                text: `PALETTE EDITING TASK

EXISTING PALETTE DATA:
${currentColorsDetailed}

Current Dominant Color: ${currentPalette.dominantColor}
Current Mood: ${currentPalette.mood}

USER REQUEST: "${userPrompt}"

CRITICAL RULES FOR EDITING:
1. PRESERVE EVERYTHING by default - only change what the user specifically requests
2. Keep ALL existing colors EXACTLY the same (hex, name, description) UNLESS the user explicitly asks to change them
3. Keep the current mood description EXACTLY the same UNLESS the user explicitly asks to change it
4. Keep the current dominant color EXACTLY the same UNLESS the user explicitly asks to change it or adds/removes colors that affect dominance

EDITING GUIDELINES:
- If user says "add [color]": Keep all existing colors unchanged, add the new color(s)
- If user says "change [specific color] to [new color]": Only change that specific color, keep everything else
- If user says "remove [color]": Remove only that color, keep everything else unchanged
- If user says "make it [mood]": Only change the mood description, keep colors unchanged
- If user says "make [color] the dominant": Only change the dominantColor field, keep everything else
- If user says "change/update/improve the descriptions": Rewrite all color descriptions while keeping exact same colors and hex values
- If user says "change/update the mood": Rewrite the mood description while keeping everything else the same
- If user says "change the mood and descriptions": Update both mood and all color descriptions while keeping exact same colors and hex values
- If user says "make it more [adjective]": Adjust descriptions and mood to reflect that quality while keeping same colors
- If user requests general improvements: Keep exact same colors but improve the names, descriptions, and mood

WHEN UPDATING DESCRIPTIONS OR MOOD:
- Apply the same enhanced reasoning principles from the main generation prompts
- Use color theory, accessibility awareness, and professional standards
- Keep descriptions concise (6-9 words for colors, 15-20 words for mood)
- Make descriptions more engaging, professional, and contextually appropriate

RETURN the palette with:
- All existing colors preserved exactly as they are, plus any requested changes
- Original mood and dominant color unless specifically requested to change
- Maximum 10 colors total

Example: If user says "add a red color" and you have 3 existing colors, return those exact 3 colors plus 1 new red color (4 total).`,
              },
            ],
          },
        ]
      }
    } else if (imageDataUrl) {
      // Image-based generation (with optional user prompt)
      const base64Data = imageDataUrl.split(',')[1]

      messages = [
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: `${COLOR_THEORY_PROMPT}

${ACCESSIBILITY_PROMPT}

${CONTEXT_ANALYSIS_PROMPT}

${PROFESSIONAL_STANDARDS_PROMPT}

TASK: Analyze this image and extract a professional color palette of ${actualColorCount} distinct colors.
${userPrompt ? `\nADDITIONAL REQUIREMENTS: ${userPrompt}` : ''}

IMAGE ANALYSIS PROCESS:
1. VISUAL ANALYSIS: Identify the most prominent, harmonious, and aesthetically pleasing colors
2. CONTEXT UNDERSTANDING: Consider the image's subject matter and intended use case
3. COLOR THEORY APPLICATION: Ensure extracted colors follow good color harmony principles
4. ACCESSIBILITY VALIDATION: Verify colors work for accessibility standards
5. PROFESSIONAL REFINEMENT: Select colors suitable for design applications

EXTRACTION GUIDELINES:
- Prioritize colors that are prominent and visually significant in the image
- Ensure extracted colors work together as a cohesive palette
- Consider the emotional and psychological impact of the color relationships
- Extract colors suitable for professional design work
- Ensure accessibility compliance for contrast ratios
- Account for color blindness considerations
- Focus on colors that tell the visual story of the image
- Avoid overly similar or redundant colors unless specifically requested

OUTPUT FORMATTING:
- Name colors creatively but professionally (2-3 words maximum)
- Write VERY BRIEF color descriptions (15-25 words max) - focus on key characteristics and feel only
- Keep mood description CONCISE (20-30 words max) - capture essence, not detailed analysis

CRITICAL: Keep all descriptions SHORT and UI-FRIENDLY while maintaining professional quality.

Think through the visual analysis and color theory principles before extracting the final palette with concise output.`,
            },
            {
              type: 'image' as const,
              image: base64Data,
            },
          ],
        },
      ]
    } else {
      // Enhanced text-only generation with comprehensive reasoning
      messages = [
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: `${COLOR_THEORY_PROMPT}

${ACCESSIBILITY_PROMPT}

${CONTEXT_ANALYSIS_PROMPT}

${PROFESSIONAL_STANDARDS_PROMPT}

TASK: Create a professional color palette of ${actualColorCount} colors based on: "${userPrompt}"

REASONING PROCESS:
1. CONTEXT ANALYSIS: First, analyze what this palette will be used for (branding, web design, art, interior design, etc.) based on the description
2. EMOTIONAL INTENT: Determine the intended mood, emotion, and psychological impact
3. COLOR THEORY APPLICATION: Choose appropriate color harmony rules (complementary, analogous, triadic, etc.)
4. ACCESSIBILITY VALIDATION: Ensure colors meet WCAG standards and work for color-blind users
5. PROFESSIONAL REFINEMENT: Validate colors work across media and use cases

REQUIREMENTS:
- Apply appropriate color theory principles for the identified use case
- Ensure WCAG 2.1 AA accessibility compliance (4.5:1 contrast minimum)
- Consider color psychology and cultural context
- Create colors that work harmoniously together
- Provide professional-grade color values suitable for design work
- Include accessibility considerations in color selection
- Consider both digital and print reproduction
- Account for color blindness accessibility (deuteranopia/protanopia)

OUTPUT GUIDELINES:
- Provide precise, professional hex values
- Name colors creatively but professionally (2-3 words maximum)
- Write VERY BRIEF color descriptions (15-25 words max) - focus on key characteristics and feel only
- Keep mood description CONCISE (20-30 words max) - capture essence, not detailed analysis
- Identify the dominant color that anchors the palette
- Ensure the palette tells a cohesive visual story

CRITICAL: Keep all descriptions SHORT and UI-FRIENDLY while maintaining professional quality.

Think through each step of the reasoning process before generating the final palette with concise output.`,
            },
          ],
        },
      ]
    }

    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: ColorPaletteSchema,
      messages,
    })

    // Ensure we don't return more than 10 colors
    const finalResult = {
      ...result.object,
      colors: result.object.colors.slice(0, 10),
    }

    return finalResult
  } catch (error) {
    console.error('Error generating color palette:', error)

    if (error instanceof Error && error.message === 'INVALID_REQUEST') {
      throw new Error('INVALID_REQUEST')
    }

    throw new Error('Failed to generate color palette')
  }
}
