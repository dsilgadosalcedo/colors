import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";
import { PaletteCard } from "./PaletteCard";
import { useColorPaletteStore } from "@/lib/store";

export function SavedPalettes() {
  const {
    savedPalettes,
    setActiveTab,
    loadSavedPalette,
    deleteSavedPalette,
    isColorInPalette,
  } = useColorPaletteStore();

  const handleLoadPalette = (palette: any) => {
    loadSavedPalette(palette);
  };

  const handleDeletePalette = (index: number) => {
    deleteSavedPalette(index);
  };

  return (
    <>
      <header className="text-center">
        <h2 className="text-2xl font-bold text-background mb-6">
          Your Saved Palettes
        </h2>
      </header>

      {savedPalettes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {savedPalettes.map((palette, index) => (
            <PaletteCard
              key={index}
              palette={palette}
              index={index}
              onLoadPalette={handleLoadPalette}
              onDeletePalette={handleDeletePalette}
              isColorInPalette={isColorInPalette}
            />
          ))}
        </div>
      ) : (
        <section className="grid place-items-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No saved palettes yet
          </h3>
          <p className="text-gray-500 mb-4">
            Generate and save color palettes to build your collection
          </p>
          <Button variant="outline" onClick={() => setActiveTab("generator")}>
            Create Your First Palette
          </Button>
        </section>
      )}
    </>
  );
}
