import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { History } from "lucide-react"
import { PaletteCard } from "./PaletteCard"
import { useColorPaletteStore } from "@/lib/store"

export function SavedPalettes() {
  const {
    savedPalettes,
    setActiveTab,
    loadSavedPalette,
    deleteSavedPalette,
    isColorInPalette,
  } = useColorPaletteStore()

  const handleLoadPalette = (palette: any) => {
    loadSavedPalette(palette)
  }

  const handleDeletePalette = (index: number) => {
    deleteSavedPalette(index)
  }

  return (
    <>
      {savedPalettes.length > 0 ? (
        <>
          <header className="text-center">
            <h2 className="text-2xl font-bold text-background mb-6">
              Your Saved Palettes
            </h2>
          </header>
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
        </>
      ) : (
        <section className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center text-center">
          <h3 className="text-4xl font-bold text-background leading-tight tracking-tight">
            No saved palettes yet
          </h3>
          <p className="text-lg text-[#77d9ab] max-w-2xl mx-auto leading-relaxed text-balance">
            Generate and save color palettes to build your collection
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => setActiveTab("generator")}
          >
            Create My First Palette
          </Button>
        </section>
      )}
    </>
  )
}
