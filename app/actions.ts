"use server"

import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

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
    "palette",
    "colors",
    "color scheme",
    "generate",
    "create",
    "make",
    "show",
    "give me",
    "want",
    "need",
    "design",
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "brown",
    "black",
    "white",
    "gray",
    "grey",
    "warm",
    "cool",
    "bright",
    "dark",
    "light",
    "vibrant",
    "pastel",
    "neon",
    "muted",
    "soft",
    "bold",
    "sunset",
    "ocean",
    "forest",
    "autumn",
    "spring",
    "summer",
    "winter",
  ]

  const lowerPrompt = prompt.toLowerCase()
  return paletteKeywords.some((keyword) => lowerPrompt.includes(keyword))
}

export async function generateColorPalette(
  imageDataUrl: string | null,
  defaultColorCount = 3,
  userPrompt?: string,
  currentPalette?: any // For editing existing palettes
) {
  try {
    // Handle text-only requests (only validate for new palette creation, not editing)
    if (!imageDataUrl && userPrompt && !currentPalette) {
      if (!isPaletteRequest(userPrompt)) {
        throw new Error("INVALID_REQUEST")
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
            hex: z.string().describe("Hex color code starting with #"),
            name: z.string().describe("Creative name for the color"),
            description: z
              .string()
              .describe(
                "Brief description of the color and its characteristics"
              ),
          })
        )
        .max(10), // Ensure we never get more than 10 colors
      dominantColor: z
        .string()
        .describe("The most prominent hex color in the palette"),
      mood: z
        .string()
        .describe("The overall mood or feeling the color palette conveys"),
    })

    let messages

    if (currentPalette) {
      // Editing existing palette
      const currentColorsDetailed = currentPalette.colors
        .map(
          (color: any, index: number) =>
            `Color ${index + 1}: ${color.name} (${color.hex}) - ${
              color.description
            }`
        )
        .join("\n")

      if (imageDataUrl) {
        // Editing with image reference
        const base64Data = imageDataUrl.split(",")[1]

        messages = [
          {
            role: "user" as const,
            content: [
              {
                type: "text" as const,
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

RETURN the palette with:
- All existing colors preserved exactly as they are, plus any requested changes
- Original mood and dominant color unless specifically requested to change
- Maximum 10 colors total

Example: If user says "add the color of that red car" and you have 3 existing colors, return those exact 3 colors plus 1 new color extracted from the red car (4 total).`,
              },
              {
                type: "image" as const,
                image: base64Data,
              },
            ],
          },
        ]
      } else {
        // Editing without image reference
        messages = [
          {
            role: "user" as const,
            content: [
              {
                type: "text" as const,
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
      const base64Data = imageDataUrl.split(",")[1]

      messages = [
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: `Analyze this image and extract a color palette of ${actualColorCount} distinct colors. ${
                userPrompt ? `Additional requirements: ${userPrompt}. ` : ""
              }Provide creative names for each color, brief descriptions, identify the dominant color, and describe the overall mood. Focus on the most prominent and visually appealing colors in the image.`,
            },
            {
              type: "image" as const,
              image: base64Data,
            },
          ],
        },
      ]
    } else {
      // Text-only generation
      messages = [
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: `Create a color palette of ${actualColorCount} colors based on this description: "${userPrompt}". Provide creative names for each color, brief descriptions, identify the dominant color, and describe the overall mood. Make sure the colors work well together as a cohesive palette.`,
            },
          ],
        },
      ]
    }

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
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
    console.error("Error generating color palette:", error)

    if (error instanceof Error && error.message === "INVALID_REQUEST") {
      throw new Error("INVALID_REQUEST")
    }

    throw new Error("Failed to generate color palette")
  }
}
