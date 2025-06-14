"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Helper function to extract color count from user prompt
function extractColorCountFromPrompt(prompt: string): number | null {
  const matches = prompt.match(/(\d+)\s*colors?/i);
  if (matches) {
    const count = parseInt(matches[1]);
    // Clamp between 3 and 10
    return Math.max(3, Math.min(10, count));
  }
  return null;
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
  ];

  const lowerPrompt = prompt.toLowerCase();
  return paletteKeywords.some((keyword) => lowerPrompt.includes(keyword));
}

export async function generateColorPalette(
  imageDataUrl: string | null,
  defaultColorCount = 3,
  userPrompt?: string
) {
  try {
    // Handle text-only requests
    if (!imageDataUrl && userPrompt) {
      if (!isPaletteRequest(userPrompt)) {
        throw new Error("INVALID_REQUEST");
      }
    }

    // Extract color count from user prompt if specified
    const promptColorCount = userPrompt
      ? extractColorCountFromPrompt(userPrompt)
      : null;
    const colorCount = promptColorCount || defaultColorCount;

    // Create dynamic schema based on color count (max 10)
    const actualColorCount = Math.min(colorCount, 10);

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
    });

    let messages;

    if (imageDataUrl) {
      // Image-based generation (with optional user prompt)
      const base64Data = imageDataUrl.split(",")[1];

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
      ];
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
      ];
    }

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: ColorPaletteSchema,
      messages,
    });

    // Ensure we don't return more than 10 colors
    const finalResult = {
      ...result.object,
      colors: result.object.colors.slice(0, 10),
    };

    return finalResult;
  } catch (error) {
    console.error("Error generating color palette:", error);

    if (error instanceof Error && error.message === "INVALID_REQUEST") {
      throw new Error("INVALID_REQUEST");
    }

    throw new Error("Failed to generate color palette");
  }
}
