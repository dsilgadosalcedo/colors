import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Trash2 } from "lucide-react";
import Image from "next/image";
import { ColorInfo, ColorPalette } from "@/lib/types";

interface PaletteCardProps {
  palette: ColorPalette;
  index: number;
  onLoadPalette: (palette: ColorPalette) => void;
  onDeletePalette: (index: number) => void;
  isColorInPalette: (colors: ColorInfo[], hexToCheck: string) => boolean;
}

export function PaletteCard({
  palette,
  index,
  onLoadPalette,
  onDeletePalette,
  isColorInPalette,
}: PaletteCardProps) {
  return (
    <Card key={index}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Image preview */}
          {palette.imagePreview && (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={palette.imagePreview || "/placeholder.svg"}
                alt="Palette source"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-sm text-gray-900">
                  {new Date(
                    palette.timestamp || Date.now()
                  ).toLocaleDateString()}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {palette.mood}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {palette.colors.length} colors
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onLoadPalette(palette)}
                  title="Load palette in generator"
                >
                  <Palette className="h-3.5 w-3.5" />
                  <span className="sr-only">Load palette</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDeletePalette(index)}
                  title="Delete palette"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete palette</span>
                </Button>
              </div>
            </div>

            {/* Color swatches - clickable to load palette */}
            <div
              className="flex gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onLoadPalette(palette)}
              title="Click to load this palette"
            >
              {/* Only show dominant color if it's not already in the palette colors */}
              {!isColorInPalette(palette.colors, palette.dominantColor) && (
                <div
                  className="w-6 h-6 rounded-full ring-1 ring-inset ring-gray-200"
                  style={{
                    backgroundColor: palette.dominantColor,
                  }}
                />
              )}

              {/* Show palette colors */}
              {palette.colors.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full ring-1 ring-inset ring-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
              ))}

              {/* Show "more" indicator if there are more than 5 colors */}
              {palette.colors.length > 5 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 ring-1 ring-inset ring-gray-200">
                  +{palette.colors.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
