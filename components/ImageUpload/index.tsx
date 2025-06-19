import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useColorPaletteStore } from '@/lib/store'
import { toast } from '@/components/ui/use-toast'
import { ExamplePrompt } from './ExamplePrompt'
import { ImageBackground } from './ImageBackground'
import { TextInputArea } from './TextInputArea'

interface ImageUploadProps {
  onGeneratePalette: (userPrompt?: string) => void
}

export function ImageUpload({ onGeneratePalette }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [userPrompt, setUserPrompt] = useState('')
  const [loadingText, setLoadingText] = useState('')
  const [wasGenerating, setWasGenerating] = useState(false)

  const {
    selectedImage,
    colorCount,
    isLoading,
    isEditingMode,
    colorTextPreview,
    isColorTextPreviewMode,
    colorPalette,
    setColorPalette,
    setDragActive,
    setColorCount,
    handleImageUpload,
    resetImageState,
    exitEditingMode,
    autoSavePalette,
  } = useColorPaletteStore()

  // Loading text animation effect
  useEffect(() => {
    if (isLoading && !wasGenerating) {
      setWasGenerating(true)
      const messages = [
        'Analyzing image colors...',
        'Extracting dominant tones...',
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
  }, [isLoading, wasGenerating])

  // Auto-save palette when generated
  useEffect(() => {
    if (colorPalette && !isEditingMode) {
      autoSavePalette(colorPalette)
    }
  }, [colorPalette, isEditingMode, autoSavePalette])

  const handleAddColorText = useCallback(
    (colorName: string) => {
      const colorText = `the color ${colorName.toLowerCase()}`
      const currentText = userPrompt.trim()
      const newText = currentText ? `${currentText} ${colorText}` : colorText
      setUserPrompt(newText)

      // Focus textarea after adding text
      if (textareaRef.current) {
        textareaRef.current.focus()
        // Move cursor to end
        const length = newText.length
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(length, length)
          }
        }, 0)
      }
    },
    [userPrompt, setUserPrompt]
  )

  // Handle color text events from ColorCard components
  useEffect(() => {
    const handleAddColorTextEvent = (event: CustomEvent) => {
      handleAddColorText(event.detail.colorName)
    }

    window.addEventListener(
      'addColorText',
      handleAddColorTextEvent as EventListener
    )
    return () => {
      window.removeEventListener(
        'addColorText',
        handleAddColorTextEvent as EventListener
      )
    }
  }, [handleAddColorText])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        handleImageUpload(file)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleGenerate = () => {
    onGeneratePalette(userPrompt.trim() || undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return
      } else {
        // Submit with Enter
        e.preventDefault()
        handleGenerate()
      }
    }
  }

  const handleExampleClick = (example: string) => {
    setUserPrompt(example)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleRemoveImage = async () => {
    try {
      resetImageState()
      setUserPrompt('')
      if (colorPalette && isEditingMode) {
        exitEditingMode()
      }
      setColorPalette(null)
      toast({
        title: 'Image removed',
        description: 'You can now upload a new image or create with text',
      })
    } catch (error) {
      console.error('Error removing image:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive',
      })
    }
  }

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
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />

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
          size="icon"
          onClick={exitEditingMode}
          disabled={isLoading}
          className="absolute top-4 md:right-10 right-4 bg-transparent text-muted-foreground hover:bg-ring hover:text-secondary-foreground border-ring hover:border-ring disabled:border-secondary disabled:cursor-not-allowed disabled:opacity-100"
        >
          <Plus />
        </Button>
      )}

      {/* Main Content Area */}
      <section className="-bottom-14 md:bottom-8 relative md:absolute md:left-1/2 md:-translate-x-1/2 md:px-6 w-[calc(100%-32px)] md:w-auto">
        {/* Example Prompt Component */}
        <ExamplePrompt
          userPrompt={userPrompt}
          isLoading={isLoading}
          onExampleClick={handleExampleClick}
        />

        {/* Text Input Area Component */}
        <TextInputArea
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          loadingText={loadingText}
          colorTextPreview={colorTextPreview}
          isColorTextPreviewMode={isColorTextPreviewMode}
          isLoading={isLoading}
          isEditingMode={isEditingMode}
          selectedImage={selectedImage}
          colorCount={colorCount}
          setColorCount={setColorCount}
          onUploadClick={handleUploadClick}
          onGenerate={handleGenerate}
          onKeyDown={handleKeyDown}
          onExitEditingMode={exitEditingMode}
          onImageUpload={handleImageUpload}
          textareaRef={textareaRef}
        />
      </section>
    </div>
  )
}
