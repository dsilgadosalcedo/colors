import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";
import { PaletteCard } from "./PaletteCard";
import { ColorInfo, ColorPalette } from "@/lib/types";

interface SavedPalettesProps {
  savedPalettes: ColorPalette[];
  onLoadPalette: (palette: ColorPalette) => void;
  onDeletePalette: (index: number) => void;
  onSwitchToGenerator: () => void;
  isColorInPalette: (colors: ColorInfo[], hexToCheck: string) => boolean;
}

export function SavedPalettes({
  savedPalettes,
  onLoadPalette,
  onDeletePalette,
  onSwitchToGenerator,
  isColorInPalette,
}: SavedPalettesProps) {
  return (
    <div className="p-8 space-y-8">
      <header className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-0">
          Your Saved Palettes
        </h2>
      </header>

      {savedPalettes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPalettes.map((palette, index) => (
            <PaletteCard
              key={index}
              palette={palette}
              index={index}
              onLoadPalette={onLoadPalette}
              onDeletePalette={onDeletePalette}
              isColorInPalette={isColorInPalette}
            />
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved palettes yet
            </h3>
            <p className="text-gray-500 mb-4">
              Generate and save color palettes to build your collection
            </p>
            <Button variant="outline" onClick={onSwitchToGenerator}>
              Create Your First Palette
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
