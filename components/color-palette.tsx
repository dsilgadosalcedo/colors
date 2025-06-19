import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Palette,
  Download,
  Share2,
  CheckCircle,
  Undo,
  Redo,
} from 'lucide-react'
import { ColorCard } from './color-card'
import { useColorPaletteStore } from '@/lib/store'

export function ColorPaletteDisplay({ state }: { state: 'show' | 'hide' }) {
  const {
    colorPalette,
    copiedColor,
    isCurrentPaletteSaved,
    canUndo,
    canRedo,
    copyToClipboard,
    savePalette,
    downloadPalette,
    sharePalette,
    undoPalette,
    redoPalette,
  } = useColorPaletteStore()

  return (
    <ColorPaletteBox state={state}>
      {colorPalette && (
        <>
          <header className="px-4 py-3 grid @xl:flex gap-4 justify-between items-center border-b sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <h3>Color Palette</h3>
              {(canUndo || canRedo) && (
                <Button size="sm" onClick={canUndo ? undoPalette : redoPalette}>
                  {canUndo ? (
                    <>
                      <Undo size={8} />
                      Undo
                    </>
                  ) : (
                    <>
                      <Redo size={8} />
                      Redo
                    </>
                  )}
                </Button>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 @xl:justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={savePalette}
                disabled={isCurrentPaletteSaved}
                // className={cn(
                //   "transition-all duration-200",
                //   isCurrentPaletteSaved &&
                //     "bg-green-50 border-green-200 text-green-700 disabled:opacity-100"
                // )}
              >
                {isCurrentPaletteSaved ? (
                  <>
                    <CheckCircle size={8} />
                    Saved
                  </>
                ) : (
                  <>
                    <Palette size={8} />
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
                <Download />
                Download CSS
              </Button>
              <Button variant="outline" size="sm" onClick={sharePalette}>
                <Share2 size={8} />
                Share
              </Button>
            </div>
          </header>

          <div className="p-4 space-y-6">
            <Alert>
              <AlertTitle>Mood</AlertTitle>
              <AlertDescription>{colorPalette.mood}</AlertDescription>
            </Alert>

            {/* Color Grid */}
            <div className="grid @lg:grid-cols-2 gap-4 overflow-y-auto">
              {colorPalette.colors
                .slice() // Create a copy to avoid mutating the original array
                .sort((a, b) => {
                  const aIsDominant =
                    a.hex.toLowerCase() ===
                    colorPalette.dominantColor.toLowerCase()
                  const bIsDominant =
                    b.hex.toLowerCase() ===
                    colorPalette.dominantColor.toLowerCase()

                  if (aIsDominant && !bIsDominant) {
                    return -1
                  } // a comes first
                  if (!aIsDominant && bIsDominant) {
                    return 1
                  } // b comes first
                  return 0 // maintain original order for non-dominant colors
                })
                .map((color, index) => {
                  const isDominantColor =
                    color.hex.toLowerCase() ===
                    colorPalette.dominantColor.toLowerCase()
                  return (
                    <ColorCard
                      key={`${color.hex}-${index}`} // Use hex + index to ensure unique keys after sorting
                      color={color}
                      copiedColor={copiedColor}
                      onCopyColor={copyToClipboard}
                      isPrimary={isDominantColor}
                    />
                  )
                })}
            </div>
          </div>
        </>
      )}
    </ColorPaletteBox>
  )
}

const ColorPaletteBox = ({
  children,
  state,
}: {
  children: React.ReactNode
  state: 'show' | 'hide'
}) => {
  return (
    <div
      className="relative flex-1 flex flex-col @container data-[state=show]:animate-in data-[state=hide]:animate-out fade-in slide-in-from-right-20 fade-out slide-out-to-right-10 duration-300 md:px-6 lg:px-0 md:mb-6 lg:mb-0 overflow-hidden lg:max-w-164 justify-self-end w-full"
      data-state={state}
    >
      <section className="rounded-t-3xl md:rounded-3xl lg:rounded-r-none lg:h-[calc(100vh-88px-28px)] lg:max-h-[calc(100vh-88px-28px)] overflow-y-auto relative bg-popover">
        {children}
      </section>
      {/* <div className="hidden lg:block w-full h-[calc(100%-24px)] -z-10 absolute top-2 left-6 bg-[#50b1d8]/30 rounded-3xl rounded-r-none blur-xs" /> */}
    </div>
  )
}
