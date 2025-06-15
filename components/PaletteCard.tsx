import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Palette, Trash2 } from "lucide-react"
import Image from "next/image"
import { ColorInfo, ColorPalette } from "@/lib/types"

interface PaletteCardProps {
  palette: ColorPalette
  index: number
  onLoadPalette: (palette: ColorPalette) => void
  onDeletePalette: (index: number) => void
  isColorInPalette: (colors: ColorInfo[], hexToCheck: string) => boolean
}

export function PaletteCard({
  palette,
  index,
  onLoadPalette,
  onDeletePalette,
  isColorInPalette,
}: PaletteCardProps) {
  return (
    <Card
      key={index}
      className="animate-in fade-in-0 duration-200 bg-[#f9f9fb]"
    >
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

          <div className="flex-1 flex flex-col justify-between">
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
                {/* <p className="text-xs text-gray-400 mt-1">
                  {palette.colors.length} colors
                </p> */}
              </div>
            </div>

            {/* Color swatches - clickable to load palette */}
            <div className="flex items-end justify-between gap-2">
              <div
                className="flex w-min gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onLoadPalette(palette)}
                title="Click to load this palette"
              >
                {/* Show palette colors with dominant color first */}
                {palette.colors
                  .slice() // Create a copy to avoid mutating the original array
                  .sort((a, b) => {
                    const aIsDominant =
                      a.hex.toLowerCase() ===
                      palette.dominantColor.toLowerCase()
                    const bIsDominant =
                      b.hex.toLowerCase() ===
                      palette.dominantColor.toLowerCase()

                    if (aIsDominant && !bIsDominant) return -1 // a comes first
                    if (!aIsDominant && bIsDominant) return 1 // b comes first
                    return 0 // maintain original order for non-dominant colors
                  })
                  .slice(0, 5)
                  .map((color, i) => (
                    <div
                      key={`${color.hex}-${i}`}
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
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="bg-transparent hover:bg-red-200/50 text-red-500 hover:text-red-500 border-red-500 hover:border-red-500 h-9 w-9"
                      title="Delete palette"
                    >
                      <Trash2 />
                      <span className="sr-only">Delete palette</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Palette</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this color palette? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeletePalette(index)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadPalette(palette)}
                  title="Load palette in generator"
                >
                  Open
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
