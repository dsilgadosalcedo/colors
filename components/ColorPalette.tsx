import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Check, Palette, Download, Share2 } from "lucide-react";
import { ColorCard } from "./ColorCard";
import { ColorPalette } from "@/lib/types";

interface ColorPaletteProps {
  colorPalette: ColorPalette | null;
  copiedColor: string | null;
  onCopyColor: (hex: string) => void;
  onSavePalette: () => void;
  onDownloadPalette: () => void;
  onSharePalette: () => void;
}

export function ColorPaletteDisplay({
  colorPalette,
  copiedColor,
  onCopyColor,
  onSavePalette,
  onDownloadPalette,
  onSharePalette,
}: ColorPaletteProps) {
  if (!colorPalette) {
    return (
      <section className="my-6 border-y border-l border-foreground/40 rounded-3xl rounded-r-none">
        <div className="grid place-content-center place-items-center h-full">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to extract colors
          </h3>
          <p className="text-gray-500 text-sm">
            Upload an image and generate a palette to see results here
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-6 border-y border-l border-foreground/40 rounded-3xl rounded-r-none">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-0">
            Your Color Palette
          </h3>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={onSavePalette}>
              <Palette className="w-3.5 h-3.5" />
              Save Palette
            </Button>
            <Button variant="outline" size="sm" onClick={onDownloadPalette}>
              <Download className="w-3.5 h-3.5" />
              Download CSS
            </Button>
            <Button variant="outline" size="sm" onClick={onSharePalette}>
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </div>

        <Alert>
          <AlertTitle>Mood</AlertTitle>
          <AlertDescription>{colorPalette.mood}</AlertDescription>
        </Alert>

        {/* Dominant Color */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Dominant Color
          </p>
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105 relative group"
              style={{
                backgroundColor: colorPalette.dominantColor,
              }}
              onClick={() => onCopyColor(colorPalette.dominantColor)}
            >
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-200">
                {copiedColor === colorPalette.dominantColor ? (
                  <Check className="w-6 h-6 text-white opacity-20 group-hover:opacity-100" />
                ) : (
                  <Copy className="w-5 h-5 text-white opacity-20 group-hover:opacity-100" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 font-mono">
              {colorPalette.dominantColor}
            </p>
          </div>
        </div>

        {/* Color Grid */}
        <div
          className={`grid gap-4 ${
            colorPalette.colors.length <= 4
              ? "grid-cols-2"
              : colorPalette.colors.length <= 6
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {colorPalette.colors.map((color, index) => (
            <ColorCard
              key={index}
              color={color}
              copiedColor={copiedColor}
              onCopyColor={onCopyColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
