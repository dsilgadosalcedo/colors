import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Copy,
  Check,
  Palette,
  Download,
  Share2,
  CheckCircle,
} from "lucide-react";
import { ColorCard } from "./ColorCard";
import { useColorPaletteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ColorPaletteDisplay() {
  const {
    colorPalette,
    copiedColor,
    isCurrentPaletteSaved,
    downloadBounce,
    copyToClipboard,
    savePalette,
    downloadPalette,
    sharePalette,
  } = useColorPaletteStore();

  const backgroundColor = "black";

  // if (!colorPalette) {
  //   return (
  //     <ColorPaletteBox>
  //       <div className="grid place-content-center place-items-center h-full bg-[#3a829f]">
  //         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <Palette className="w-8 h-8 text-gray-300" />
  //         </div>
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">
  //           Ready to display your palette
  //         </h3>
  //         <p className="text-gray-500 text-sm">
  //           Upload an image and generate a palette to see results here.
  //         </p>
  //       </div>
  //     </ColorPaletteBox>
  //   );
  // }

  return (
    <ColorPaletteBox>
      <div className="px-4 py-3 grid md:flex gap-4 justify-between items-center border-b bg-sidebar">
        <h3 className="text-gray-900 mb-0">Your Color Palette</h3>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={savePalette}
            disabled={isCurrentPaletteSaved}
            className={cn(
              "transition-all duration-200",
              isCurrentPaletteSaved &&
                "bg-green-50 border-green-200 text-green-700"
            )}
          >
            {isCurrentPaletteSaved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Saved
              </>
            ) : (
              <>
                <Palette className="w-3.5 h-3.5" />
                Save Palette
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPalette}
            className="relative"
          >
            <Download
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-300",
                downloadBounce && "animate-bounce"
              )}
            />
            Download CSS
          </Button>
          <Button variant="outline" size="sm" onClick={sharePalette}>
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        </div>
      </div>

      {colorPalette && (
        <div className="p-4 space-y-6">
          <Alert>
            <AlertTitle>Mood</AlertTitle>
            <AlertDescription>{colorPalette.mood}</AlertDescription>
          </Alert>

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
            {colorPalette.colors
              .slice() // Create a copy to avoid mutating the original array
              .sort((a, b) => {
                const aIsDominant =
                  a.hex.toLowerCase() ===
                  colorPalette.dominantColor.toLowerCase();
                const bIsDominant =
                  b.hex.toLowerCase() ===
                  colorPalette.dominantColor.toLowerCase();

                if (aIsDominant && !bIsDominant) return -1; // a comes first
                if (!aIsDominant && bIsDominant) return 1; // b comes first
                return 0; // maintain original order for non-dominant colors
              })
              .map((color, index) => {
                const isDominantColor =
                  color.hex.toLowerCase() ===
                  colorPalette.dominantColor.toLowerCase();
                return (
                  <ColorCard
                    key={`${color.hex}-${index}`} // Use hex + index to ensure unique keys after sorting
                    color={color}
                    copiedColor={copiedColor}
                    onCopyColor={copyToClipboard}
                    isPrimary={isDominantColor}
                  />
                );
              })}
          </div>
        </div>
      )}
    </ColorPaletteBox>
  );
}

const ColorPaletteBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex-1 flex flex-col">
      <section className="bg-background md:rounded-3xl lg:rounded-r-none h-[calc(100%-28px)] overflow-hidden">
        {children}
      </section>
      <div className="w-full h-[calc(100%-24px)] -z-10 absolute top-2 left-6 bg-[#50b1d8]/50 rounded-3xl rounded-r-none blur-xs"></div>
    </div>
  );
};
