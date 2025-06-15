'use client'

import type React from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { generateColorPalette } from './actions'
import { toast } from '@/components/ui/use-toast'
import { useColorPaletteStore } from '@/lib/store'
import { useRef, useEffect } from 'react'

// Components
import { Header } from '@/components/Header'
import { ImageUpload } from '@/components/ImageUpload'
import { ColorPaletteDisplay } from '@/components/ColorPalette'
import { SavedPalettes } from '@/components/SavedPalettes'
import { DragOverlay } from '@/components/DragOverlay'
import { cn } from '@/lib/utils'

export default function ColorPaletteGenerator() {
  const dragCounter = useRef(0)

  // Zustand store
  const {
    colorPalette,
    selectedImage,
    colorCount,
    activeTab,
    pageDragActive,
    isEditingMode,
    setColorPalette,
    setIsLoading,
    setActiveTab,
    setPageDragActive,
    handleImageUpload,
    initializeApp,
  } = useColorPaletteStore()

  // Initialize app with default image for first-time users
  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  const generatePalette = async (userPrompt?: string) => {
    // Allow generation with either image or text prompt, or editing existing palette
    if (!selectedImage && !userPrompt?.trim() && !isEditingMode) {
      return
    }

    // In editing mode, we need a user prompt to know what to edit
    if (isEditingMode && !userPrompt?.trim()) {
      return
    }

    setIsLoading(true)
    try {
      const result = await generateColorPalette(
        selectedImage, // Always pass the image if available (for both generation and editing)
        colorCount,
        userPrompt,
        isEditingMode ? colorPalette : undefined // Pass current palette for editing
      )
      const paletteWithTimestamp = {
        ...result,
        timestamp: Date.now(),
        imagePreview: selectedImage || undefined,
      }
      setColorPalette(paletteWithTimestamp)
    } catch (error) {
      console.error('Error generating palette:', error)

      if (error instanceof Error && error.message === 'INVALID_REQUEST') {
        toast({
          title: 'No palette generated',
          description:
            'Please provide a clear description of the colors you want or upload an image.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to generate color palette. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Page-level drag handlers
  const handlePageDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only handle page-level drag when on generator tab
    if (activeTab !== 'generator') {
      return
    }

    dragCounter.current++
    if (dragCounter.current === 1) {
      setPageDragActive(true)
    }
  }

  const handlePageDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only handle page-level drag when on generator tab
    if (activeTab !== 'generator') {
      return
    }

    dragCounter.current--
    if (dragCounter.current === 0) {
      setPageDragActive(false)
    }
  }

  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only handle page-level drag when on generator tab
    if (activeTab !== 'generator') {
      return
    }
  }

  const handlePageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only handle page-level drag when on generator tab
    if (activeTab !== 'generator') {
      return
    }

    dragCounter.current = 0
    setPageDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        handleImageUpload(file)
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <>
      <Header />

      <main
        className="flex-1 flex flex-col"
        onDragEnter={handlePageDragEnter}
        onDragLeave={handlePageDragLeave}
        onDragOver={handlePageDragOver}
        onDrop={handlePageDrop}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsContent value="generator" className="flex-1 flex flex-col">
            <div
              className={cn(
                'flex-1 grid lg:grid-cols-[5fr_0fr] transition-all duration-300 gap-4 md:gap-6 lg:gap-0',
                colorPalette && 'lg:grid-cols-[5fr_4fr]'
              )}
            >
              {/* Upload Section */}
              <ImageUpload onGeneratePalette={generatePalette} />

              {/* Results Section */}
              <ColorPaletteDisplay state={colorPalette ? 'show' : 'hide'} />
            </div>
          </TabsContent>

          <TabsContent value="collection" className="flex-1">
            <SavedPalettes />
          </TabsContent>
        </Tabs>

        {/* Drag Overlay - only show when generator tab is active */}
        <DragOverlay isVisible={pageDragActive && activeTab === 'generator'} />
      </main>
    </>
  )
}
