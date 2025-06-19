import React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Paperclip, Send } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TextInputAreaProps {
  userPrompt: string
  setUserPrompt: (prompt: string) => void
  loadingText: string
  colorTextPreview: string
  isColorTextPreviewMode: boolean
  isLoading: boolean
  isEditingMode: boolean
  selectedImage: string | null
  colorCount: number
  setColorCount: (count: number) => void
  onUploadClick: () => void
  onGenerate: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onExitEditingMode: () => void
  onImageUpload: (file: File) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export function TextInputArea({
  userPrompt,
  setUserPrompt,
  loadingText,
  colorTextPreview,
  isColorTextPreviewMode,
  isLoading,
  isEditingMode,
  selectedImage,
  colorCount,
  setColorCount,
  onUploadClick,
  onGenerate,
  onKeyDown,
  onExitEditingMode,
  onImageUpload,
  textareaRef,
}: TextInputAreaProps) {
  const handlePaste = (e: React.ClipboardEvent) => {
    // Don't interfere if we're in loading state or color text preview mode
    if (isLoading || isColorTextPreviewMode) {
      return
    }

    const items = e.clipboardData?.items
    if (!items) return

    // Look for image files in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      if (item.type.startsWith('image/')) {
        e.preventDefault() // Prevent default paste behavior

        const file = item.getAsFile()
        if (file) {
          onImageUpload(file)
        }
        return
      }
    }

    // If no image found, allow normal text pasting
  }

  return (
    <Card className="backdrop-blur-sm p-3 relative md:w-140 border-none">
      <Textarea
        ref={textareaRef}
        value={
          isLoading
            ? loadingText
            : isColorTextPreviewMode
              ? `${userPrompt}${userPrompt.trim() ? ' ' : ''}${colorTextPreview}`
              : userPrompt
        }
        onChange={e =>
          !isLoading && !isColorTextPreviewMode && setUserPrompt(e.target.value)
        }
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
        placeholder={
          isEditingMode
            ? 'Edit your palette'
            : selectedImage
              ? 'Add specifications'
              : 'Describe your palette'
        }
        className={cn(
          'resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 min-h-[28px] text-lg font-medium border-none rounded-none',
          isColorTextPreviewMode && 'text-muted-foreground'
        )}
        disabled={isLoading}
        readOnly={isLoading || isColorTextPreviewMode}
      />

      <div className="flex items-center justify-between gap-4 mt-2">
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onUploadClick}
            disabled={isLoading || isEditingMode}
            className="bg-transparent text-muted-foreground hover:bg-ring hover:text-secondary-foreground border-ring hover:border-ring disabled:border-secondary disabled:cursor-not-allowed disabled:opacity-100"
          >
            <Paperclip />
          </Button>
          <Switch
            id="editing"
            checked={isEditingMode}
            onCheckedChange={checked => {
              if (!checked && isEditingMode) {
                onExitEditingMode()
              }
            }}
            disabled={!isEditingMode}
            className="data-[state=checked]:bg-ring data-[state=unchecked]:bg-transparent border border-ring w-14 disabled:border-secondary disabled:cursor-not-allowed disabled:opacity-100 rounded-md"
          />
          <Label htmlFor="editing" className="text-card-foreground">
            Editing
          </Label>
        </div>

        <div className="flex items-center justify-center gap-2">
          {/* Color Count Selector */}
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="color-count"
              className="text-sm font-medium text-card-foreground"
            >
              <span className="hidden md:block">Number of colors</span>
              <span className="block md:hidden">Colors</span>
            </Label>
            <Select
              value={colorCount.toString()}
              onValueChange={value => setColorCount(Number.parseInt(value))}
              disabled={isLoading || isEditingMode}
            >
              <SelectTrigger
                id="color-count"
                className="w-20 h-10 text-xs p-2 rounded-md"
              >
                <SelectValue placeholder={colorCount.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="accent"
            size="icon"
            onClick={onGenerate}
            disabled={isLoading || (!selectedImage && !userPrompt.trim())}
          >
            <Send />
          </Button>
        </div>
      </div>
    </Card>
  )
}
