"use server"

import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

export async function generateColorPalette(imageDataUrl: string, colorCount = 6) {
  try {
    // Convert data URL to base64
    const base64Data = imageDataUrl.split(",")[1]

    // Create dynamic schema based on color count
    const ColorPaletteSchema = z.object({
      colors: z
        .array(
          z.object({
            hex: z.string().describe("Hex color code starting with #"),
            name: z.string().describe("Creative name for the color"),
            description: z.string().describe("Brief description of the color and its characteristics"),
          }),
        )
        .length(colorCount),
      dominantColor: z.string().describe("The most prominent hex color in the image"),
      mood: z.string().describe("The overall mood or feeling the color palette conveys"),
    })

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp", {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      }),
      schema: ColorPaletteSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and extract a color palette of ${colorCount} distinct colors. Provide creative names for each color, brief descriptions, identify the dominant color, and describe the overall mood. Focus on the most prominent and visually appealing colors in the image.`,
            },
            {
              type: "image",
              image: base64Data,
            },
          ],
        },
      ],
    })

    return result.object
  } catch (error) {
    console.error("Error generating color palette:", error)
    throw new Error("Failed to generate color palette")
  }
}
