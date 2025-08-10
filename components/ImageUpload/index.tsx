import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useColorPaletteStore } from '@/lib/store'
import { toast } from '@/components/ui/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { ImageBackground } from './ImageBackground'
import { TextInputArea } from './TextInputArea'

interface ImageUploadProps {
  onGeneratePalette: (userPrompt?: string) => void
}

export function ImageUpload({ onGeneratePalette }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [loadingText, setLoadingText] = useState('')
  const [wasGenerating, setWasGenerating] = useState(false)
  const isMobile = useIsMobile()
  const lastAutoSavedTimestampRef = useRef<number | null>(null)

  const selectedImage = useColorPaletteStore(state => state.selectedImage)
  const colorCount = useColorPaletteStore(state => state.colorCount)
  const isLoading = useColorPaletteStore(state => state.isLoading)
  const isEditingMode = useColorPaletteStore(state => state.isEditingMode)
  const colorTextPreview = useColorPaletteStore(state => state.colorTextPreview)
  const isColorTextPreviewMode = useColorPaletteStore(
    state => state.isColorTextPreviewMode
  )
  const colorPalette = useColorPaletteStore(state => state.colorPalette)
  const isCurrentPaletteSaved = useColorPaletteStore(
    state => state.isCurrentPaletteSaved
  )
  const setColorPalette = useColorPaletteStore(state => state.setColorPalette)
  const setDragActive = useColorPaletteStore(state => state.setDragActive)
  const setColorCount = useColorPaletteStore(state => state.setColorCount)
  const handleImageUpload = useColorPaletteStore(
    state => state.handleImageUpload
  )
  const resetImageState = useColorPaletteStore(state => state.resetImageState)
  const exitEditingMode = useColorPaletteStore(state => state.exitEditingMode)
  const autoSavePalette = useColorPaletteStore(state => state.autoSavePalette)

  // Loading text animation effect
  useEffect(() => {
    if (isLoading && !wasGenerating) {
      setWasGenerating(true)

      const messages = selectedImage
        ? [
            'Analyzing image colors...',
            'Extracting dominant tones...',
            'Creating beautiful palette...',
            'Almost ready...',
          ]
        : [
            'Analyzing your request...',
            'Applying color theory...',
            'Creating beautiful palette...',
            'Almost ready...',
          ]

      let messageIndex = 0
      setLoadingText(messages[0])

      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length
        setLoadingText(messages[messageIndex])
      }, 1500)

      return () => clearInterval(interval)
    } else if (!isLoading && wasGenerating) {
      setWasGenerating(false)
      setLoadingText('')
    }
  }, [isLoading, wasGenerating, selectedImage])

  // Auto-save palette when generated (only once per palette)
  useEffect(() => {
    if (
      colorPalette &&
      !isEditingMode &&
      !isCurrentPaletteSaved &&
      colorPalette.timestamp !== lastAutoSavedTimestampRef.current
    ) {
      autoSavePalette(colorPalette)
      lastAutoSavedTimestampRef.current = colorPalette.timestamp ?? Date.now()
    }
  }, [colorPalette, isEditingMode, isCurrentPaletteSaved, autoSavePalette])

  // Drag and file handlers
  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    },
    [setDragActive]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith('image/')) {
          handleImageUpload(file)
        }
      }
    },
    [handleImageUpload, setDragActive]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleImageUpload(e.target.files[0])
      }
    },
    [handleImageUpload]
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleCameraClick = useCallback(() => {
    cameraInputRef.current?.click()
  }, [])

  const handleRemoveImage = useCallback(async () => {
    try {
      resetImageState()
      if (colorPalette && isEditingMode) {
        exitEditingMode()
      }
      setColorPalette(null)
    } catch (error) {
      console.error('Error removing image:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive',
      })
    }
  }, [
    resetImageState,
    colorPalette,
    isEditingMode,
    exitEditingMode,
    setColorPalette,
  ])

  const onCamera = isMobile ? handleCameraClick : undefined

  return (
    <div
      className="animate-in fade-in-30 duration-200 relative gap-6 backdrop-blur-md grid md:place-content-center place-items-center py-10 lg:py-0 h-[calc(70vh)] lg:h-auto lg:max-h-[calc(100vh-88px-28px)]"
      onDragEnter={!isEditingMode ? handleDrag : undefined}
      onDragLeave={!isEditingMode ? handleDrag : undefined}
      onDragOver={!isEditingMode ? handleDrag : undefined}
      onDrop={!isEditingMode ? handleDrop : undefined}
    >
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
          {isEditingMode ? 'Edit your palette' : 'Create beautiful colors'}
        </h2>
        <p
          className={cn(
            'text-lg text-muted-foreground md:max-w-2xl mx-auto leading-relaxed text-balance mt-6 md:mt-0',
            isEditingMode ? 'max-w-sm' : 'max-w-xs'
          )}
        >
          {isEditingMode
            ? 'Describe changes you want to make to your palette'
            : 'Upload an image or describe what you want'}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {isMobile && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
      )}

      {/* Background Image Component */}
      <ImageBackground
        selectedImage={selectedImage}
        isLoading={isLoading}
        onRemoveImage={handleRemoveImage}
      />

      {/* Exit Editing Button */}
      {!!colorPalette && (
        <Button
          variant="outline"
          size="sm"
          onClick={exitEditingMode}
          disabled={isLoading}
          className="absolute top-4 md:right-10 right-4 bg-transparent text-muted-foreground hover:bg-ring hover:text-secondary-foreground border-ring hover:border-ring disabled:border-secondary disabled:cursor-not-allowed disabled:opacity-100"
        >
          <Plus />
          <span className="hidden md:block">Create new palette</span>
          <span className="md:hidden">New palette</span>
        </Button>
      )}

      {/* Main Content Area */}
      <section className="-bottom-14 md:bottom-8 relative md:absolute md:left-1/2 md:-translate-x-1/2 md:px-6 w-[calc(100%-32px)] md:w-auto">
        <TextInputArea
          loadingText={loadingText}
          colorTextPreview={colorTextPreview}
          isColorTextPreviewMode={isColorTextPreviewMode}
          isLoading={isLoading}
          isEditingMode={isEditingMode}
          selectedImage={selectedImage}
          colorCount={colorCount}
          setColorCount={setColorCount}
          onUploadClick={handleUploadClick}
          onCameraClick={onCamera}
          onExitEditingMode={exitEditingMode}
          onImageUpload={handleImageUpload}
          onGeneratePalette={onGeneratePalette}
        />
      </section>
    </div>
  )
}
