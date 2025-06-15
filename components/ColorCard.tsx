import { Copy, Check, Edit, Edit2Icon } from "lucide-react"
import { ColorInfo } from "@/lib/types"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { useColorPaletteStore } from "@/lib/store"

interface ColorCardProps {
  color: ColorInfo
  copiedColor: string | null
  onCopyColor: (hex: string) => void
  isPrimary?: boolean
}

export function ColorCard({
  color,
  copiedColor,
  onCopyColor,
  isPrimary = false,
}: ColorCardProps) {
  const { setColorTextPreview, clearColorTextPreview, addColorTextToPrompt } =
    useColorPaletteStore()

  const handleEditMouseEnter = () => {
    setColorTextPreview(color.name)
  }

  const handleEditMouseLeave = () => {
    clearColorTextPreview()
  }

  const handleEditClick = () => {
    // For now, we'll modify the handleAddColorText in ImageUpload to handle this
    // We need to pass the color name to add it to the prompt
    const event = new CustomEvent("addColorText", {
      detail: { colorName: color.name },
    })
    window.dispatchEvent(event)
  }
  return (
    <div
      className="group rounded-3xl relative"
      style={{
        border: `2px solid ${color.hex}`,
      }}
    >
      <div
        className="w-[calc(100%-4px)] h-20 -translate-y-1 group-hover:translate-y-0 grid place-items-center rounded-3xl transition-all duration-300 group-hover:rounded-b-4xl group-hover:rounded-t-[20px] m-0.5 cursor-pointer"
        style={{ backgroundColor: color.hex }}
        onClick={() => onCopyColor(color.hex)}
      >
        {copiedColor === color.hex ? (
          <Check className="w-6 h-6 text-white opacity-40 group-hover:opacity-100 group-hover:scale-105 animate-in fade-in-0 duration-200" />
        ) : (
          <Copy className="w-5 h-5 text-white opacity-40 group-hover:opacity-100 group-hover:scale-105 animate-in fade-in-0 duration-200" />
        )}
      </div>
      {isPrimary ? (
        <Badge variant="secondary" className="text-xs absolute top-2 left-2.5">
          Primary
        </Badge>
      ) : null}
      <Badge className="text-xs absolute top-2 right-2.5">{color.name}</Badge>
      <div className="my-3 mx-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-gray-600 font-mono font-bold mt-0.5 mb-0">
              {color.hex}
            </p>
            <p className="text-xs text-gray-500 leading-tight line-clamp-2 font-medium mt-1">
              {color.description}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9"
            onMouseEnter={handleEditMouseEnter}
            onMouseLeave={handleEditMouseLeave}
            onClick={handleEditClick}
          >
            <Edit2Icon size={8} />
          </Button>
        </div>
      </div>
    </div>
  )
}
