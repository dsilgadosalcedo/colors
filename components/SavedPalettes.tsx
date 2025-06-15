import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { History, Heart } from "lucide-react"
import { PaletteCard } from "./PaletteCard"
import { useColorPaletteStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function SavedPalettes() {
  const {
    savedPalettes,
    setActiveTab,
    loadSavedPalette,
    deleteSavedPalette,
    toggleFavorite,
    getFavoritePalettes,
    isColorInPalette,
  } = useColorPaletteStore()

  const handleLoadPalette = (palette: any) => {
    loadSavedPalette(palette)
  }

  const handleDeletePalette = (index: number) => {
    deleteSavedPalette(index)
  }

  const handleToggleFavorite = (index: number) => {
    toggleFavorite(index)
  }

  const favoritePalettes = getFavoritePalettes()
  const regularPalettes = savedPalettes.filter((palette) => !palette.isFavorite)

  return (
    <>
      {savedPalettes.length > 0 ? (
        <>
          {/* Favorites Section */}
          {favoritePalettes.length > 0 && (
            <AnimatedSection
              className="md:bg-gradient-to-r from-[#50b1d8] via-[#77d9ab] to-transparent py-6 md:m-6 rounded-l-[38px]"
              state={favoritePalettes.length > 0 ? "show" : "hide"}
            >
              <>
                <header className="px-6 mb-4">
                  <h2 className="text-2xl font-bold text-background mb-6">
                    Favorites · {favoritePalettes.length}
                  </h2>
                </header>
                <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 px-6">
                  {favoritePalettes.map((palette, favoriteIndex) => {
                    // Find the actual index in savedPalettes
                    const actualIndex = savedPalettes.findIndex(
                      (p) => p === palette
                    )
                    return (
                      <PaletteCard
                        key={`favorite-${actualIndex}`}
                        palette={palette}
                        index={actualIndex}
                        onLoadPalette={handleLoadPalette}
                        onDeletePalette={handleDeletePalette}
                        onToggleFavorite={handleToggleFavorite}
                        isColorInPalette={isColorInPalette}
                      />
                    )
                  })}
                </ul>
              </>
            </AnimatedSection>
          )}

          {/* Regular Palettes Section */}
          {regularPalettes.length > 0 && (
            <div className="py-8 md:m-6 relative">
              <div className="absolute top-0 -left-1 w-1 h-full bg-[#2f6441] rounded-full" />
              <div className="px-6 mb-4">
                <h2 className="text-2xl font-bold text-background mb-6">
                  Palettes · {regularPalettes.length}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 px-6 pb-6">
                {regularPalettes.map((palette, regularIndex) => {
                  // Find the actual index in savedPalettes
                  const actualIndex = savedPalettes.findIndex(
                    (p) => p === palette
                  )
                  return (
                    <PaletteCard
                      key={`regular-${actualIndex}`}
                      palette={palette}
                      index={actualIndex}
                      onLoadPalette={handleLoadPalette}
                      onDeletePalette={handleDeletePalette}
                      onToggleFavorite={handleToggleFavorite}
                      isColorInPalette={isColorInPalette}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <section className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center text-center transition-all duration-300">
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

const AnimatedSection = ({
  children,
  className,
  state,
}: {
  children: React.ReactNode
  className?: string
  state: "show" | "hide"
}) => {
  return (
    <section
      className={cn(
        "data-[state=show]:animate-in data-[state=hide]:animate-out fade-in slide-in-from-right-10 fade-out slide-out-to-right-10 duration-300",
        className
      )}
      data-state={state}
    >
      {children}
    </section>
  )
}
