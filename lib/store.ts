import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ColorInfo, ColorPalette } from "./types"
import { toast } from "@/components/ui/use-toast"

// Helper function to compress image data URL
const compressImage = (
  dataUrl: string,
  quality: number = 0.3
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions (max 200px width/height)
      const maxSize = 200
      let { width, height } = img

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
      resolve(compressedDataUrl)
    }

    img.src = dataUrl
  })
}

interface ColorPaletteState {
  // UI State
  selectedImage: string | null
  colorPalette: ColorPalette | null
  isLoading: boolean
  dragActive: boolean
  pageDragActive: boolean
  copiedColor: string | null
  colorCount: number
  activeTab: string
  isCurrentPaletteSaved: boolean
  downloadBounce: boolean
  isEditingMode: boolean
  editingPaletteIndex: number | null // Track which palette is being edited

  // Color text preview state
  colorTextPreview: string
  isColorTextPreviewMode: boolean

  // Undo/Redo State
  previousPalette: ColorPalette | null
  previousPaletteWasSaved: boolean
  hasUndone: boolean
  canUndo: boolean
  canRedo: boolean

  // Persisted State
  savedPalettes: ColorPalette[]

  // Actions
  setSelectedImage: (image: string | null) => void
  setColorPalette: (palette: ColorPalette | null) => void
  setIsLoading: (loading: boolean) => void
  setDragActive: (active: boolean) => void
  setPageDragActive: (active: boolean) => void
  setCopiedColor: (color: string | null) => void
  setColorCount: (count: number) => void
  setActiveTab: (tab: string) => void
  setDownloadBounce: (bounce: boolean) => void
  setIsEditingMode: (editing: boolean) => void

  // Color text preview actions
  setColorTextPreview: (colorName: string) => void
  clearColorTextPreview: () => void
  addColorTextToPrompt: (colorName: string) => void

  // Undo/Redo Actions
  undoPalette: () => void
  redoPalette: () => void
  updatePaletteWithHistory: (palette: ColorPalette | null) => void

  // Business Logic Actions
  handleImageUpload: (file: File) => void
  copyToClipboard: (hex: string) => void
  savePalette: () => Promise<void>
  deleteSavedPalette: (index: number) => void
  loadSavedPalette: (palette: ColorPalette) => void
  exitEditingMode: () => void
  downloadPalette: () => void
  sharePalette: () => Promise<void>
  isColorInPalette: (colors: ColorInfo[], hexToCheck: string) => boolean
  checkIfCurrentPaletteIsSaved: () => void

  // Reset functions
  resetImageState: () => void
  clearCopiedColor: () => void

  // Auto-save function
  autoSavePalette: (palette: ColorPalette) => Promise<void>
}

// Helper function to create a palette with compressed image for storage
const createStorablePalette = async (
  palette: ColorPalette
): Promise<ColorPalette> => {
  if (!palette.imagePreview) {
    return palette
  }

  try {
    const compressedImage = await compressImage(palette.imagePreview)
    return {
      ...palette,
      imagePreview: compressedImage,
    }
  } catch (error) {
    console.error("Error compressing image:", error)
    // Return palette without image if compression fails
    const { imagePreview, ...paletteWithoutImage } = palette
    return paletteWithoutImage as ColorPalette
  }
}

// Helper function to check if two palettes are the same (ignoring image data)
const arePalettesEqual = (
  palette1: ColorPalette,
  palette2: ColorPalette
): boolean => {
  return (
    palette1.dominantColor === palette2.dominantColor &&
    palette1.colors.length === palette2.colors.length &&
    palette1.colors.every((c, i) => c.hex === palette2.colors[i].hex)
  )
}

export const useColorPaletteStore = create<ColorPaletteState>()(
  persist(
    (set, get) => ({
      // Initial State
      selectedImage: null,
      colorPalette: null,
      isLoading: false,
      dragActive: false,
      pageDragActive: false,
      copiedColor: null,
      colorCount: 3,
      activeTab: "generator",
      savedPalettes: [],
      isCurrentPaletteSaved: false,
      downloadBounce: false,
      isEditingMode: false,
      editingPaletteIndex: null,

      // Color text preview state
      colorTextPreview: "",
      isColorTextPreviewMode: false,

      // Undo/Redo State
      previousPalette: null,
      previousPaletteWasSaved: false,
      hasUndone: false,
      canUndo: false,
      canRedo: false,

      // Basic Setters
      setSelectedImage: (image) => set({ selectedImage: image }),
      setColorPalette: (palette) => {
        const { isEditingMode } = get()
        if (isEditingMode && palette) {
          // Use history tracking when editing
          get().updatePaletteWithHistory(palette)
        } else {
          // Regular update when not editing
          set({
            colorPalette: palette,
            isEditingMode: isEditingMode,
            previousPalette: null,
            previousPaletteWasSaved: false,
            hasUndone: false,
            canUndo: false,
            canRedo: false,
          })
          // Check if the new palette is already saved
          if (palette) {
            get().checkIfCurrentPaletteIsSaved()
          } else {
            set({ isCurrentPaletteSaved: false })
          }
        }
      },
      setIsLoading: (loading) => set({ isLoading: loading }),
      setDragActive: (active) => set({ dragActive: active }),
      setPageDragActive: (active) => set({ pageDragActive: active }),
      setCopiedColor: (color) => set({ copiedColor: color }),
      setColorCount: (count) => set({ colorCount: count }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setDownloadBounce: (bounce) => set({ downloadBounce: bounce }),
      setIsEditingMode: (editing) => set({ isEditingMode: editing }),

      // Color text preview actions
      setColorTextPreview: (colorName) =>
        set({
          colorTextPreview: `"${colorName}" color`,
          isColorTextPreviewMode: true,
        }),
      clearColorTextPreview: () =>
        set({
          colorTextPreview: "",
          isColorTextPreviewMode: false,
        }),
      addColorTextToPrompt: (colorName) => {
        // This will be handled by the ImageUpload component
        set({
          colorTextPreview: "",
          isColorTextPreviewMode: false,
        })
      },

      // Undo/Redo Actions
      undoPalette: () => {
        const {
          colorPalette,
          previousPalette,
          previousPaletteWasSaved,
          isCurrentPaletteSaved,
          isEditingMode,
        } = get()
        if (previousPalette) {
          set({
            colorPalette: previousPalette,
            selectedImage: previousPalette.imagePreview || null, // Restore the image
            previousPalette: colorPalette,
            previousPaletteWasSaved: isCurrentPaletteSaved,
            isCurrentPaletteSaved: previousPaletteWasSaved,
            hasUndone: true,
            canUndo: false,
            canRedo: true,
          })

          // Auto-save if in editing mode
          if (isEditingMode) {
            get().autoSavePalette(previousPalette)
          }
        }
      },
      redoPalette: () => {
        const {
          colorPalette,
          previousPalette,
          previousPaletteWasSaved,
          isCurrentPaletteSaved,
          isEditingMode,
        } = get()
        if (previousPalette && get().hasUndone) {
          set({
            colorPalette: previousPalette,
            selectedImage: previousPalette.imagePreview || null, // Restore the image
            previousPalette: colorPalette,
            previousPaletteWasSaved: isCurrentPaletteSaved,
            isCurrentPaletteSaved: previousPaletteWasSaved,
            hasUndone: false,
            canUndo: true,
            canRedo: false,
          })

          // Auto-save if in editing mode
          if (isEditingMode) {
            get().autoSavePalette(previousPalette)
          }
        }
      },
      updatePaletteWithHistory: (palette: ColorPalette | null) => {
        const { colorPalette, isCurrentPaletteSaved, isEditingMode } = get()
        if (palette && colorPalette) {
          // Store current palette as previous before updating
          set({
            previousPalette: colorPalette,
            previousPaletteWasSaved: isCurrentPaletteSaved,
            colorPalette: palette,
            hasUndone: false,
            canUndo: true,
            canRedo: false,
          })

          // Auto-save if in editing mode, otherwise check save status
          if (isEditingMode) {
            get().autoSavePalette(palette)
          } else {
            get().checkIfCurrentPaletteIsSaved()
          }
        } else {
          // Regular palette update without history
          set({
            colorPalette: palette,
            previousPalette: null,
            previousPaletteWasSaved: false,
            hasUndone: false,
            canUndo: false,
            canRedo: false,
          })
          if (palette && isEditingMode) {
            get().autoSavePalette(palette)
          } else if (palette) {
            get().checkIfCurrentPaletteIsSaved()
          }
        }
      },

      // Business Logic Actions
      handleImageUpload: (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          set({
            selectedImage: e.target?.result as string,
            colorPalette: null,
            isCurrentPaletteSaved: false,
            isEditingMode: false, // Exit editing mode when uploading new image
            editingPaletteIndex: null, // Reset editing index
            previousPalette: null,
            previousPaletteWasSaved: false,
            hasUndone: false,
            canUndo: false,
            canRedo: false,
          })
        }
        reader.readAsDataURL(file)
      },

      copyToClipboard: (hex: string) => {
        navigator.clipboard.writeText(hex)
        set({ copiedColor: hex })
        setTimeout(() => {
          set({ copiedColor: null })
        }, 2000)
      },

      checkIfCurrentPaletteIsSaved: () => {
        const { colorPalette, savedPalettes } = get()
        if (!colorPalette) {
          set({ isCurrentPaletteSaved: false })
          return
        }

        const exists = savedPalettes.some((p) =>
          arePalettesEqual(p, colorPalette)
        )
        set({ isCurrentPaletteSaved: exists })
      },

      savePalette: async () => {
        const { colorPalette, savedPalettes } = get()
        if (!colorPalette) return

        // Check if palette already exists to avoid duplicates
        const exists = savedPalettes.some((p) =>
          arePalettesEqual(p, colorPalette)
        )

        if (exists) {
          toast({
            title: "Already saved",
            description: "This color palette is already in your collection",
          })
          return
        }

        try {
          // Create a storable version with compressed image
          const storablePalette = await createStorablePalette(colorPalette)
          const newSavedPalettes = [storablePalette, ...savedPalettes].slice(
            0,
            10
          )

          set({
            savedPalettes: newSavedPalettes,
            isCurrentPaletteSaved: true,
            isEditingMode: true, // Enter editing mode after saving a palette
            editingPaletteIndex: 0, // The new palette is at index 0
          })
        } catch (error) {
          console.error("Error saving palette:", error)
          toast({
            title: "Storage Error",
            description: "Unable to save palette. Storage quota exceeded.",
            variant: "destructive",
          })
        }
      },

      deleteSavedPalette: (index: number) => {
        const { savedPalettes, editingPaletteIndex } = get()
        const newSavedPalettes = savedPalettes.filter((_, i) => i !== index)

        // Update editing index if affected by deletion
        let newEditingPaletteIndex = editingPaletteIndex
        if (editingPaletteIndex !== null) {
          if (editingPaletteIndex === index) {
            // If the palette being edited was deleted, exit editing mode
            newEditingPaletteIndex = null
          } else if (editingPaletteIndex > index) {
            // If the deleted palette was before the editing one, shift index down
            newEditingPaletteIndex = editingPaletteIndex - 1
          }
        }

        set({
          savedPalettes: newSavedPalettes,
          editingPaletteIndex: newEditingPaletteIndex,
          isEditingMode: newEditingPaletteIndex !== null,
        })

        // Check if current palette is still saved after deletion
        get().checkIfCurrentPaletteIsSaved()
      },

      loadSavedPalette: (palette: ColorPalette) => {
        const { savedPalettes } = get()
        // Find the index of the palette being loaded
        const paletteIndex = savedPalettes.findIndex((p) =>
          arePalettesEqual(p, palette)
        )

        set({
          colorPalette: palette,
          selectedImage: palette.imagePreview || null, // Restore image if available
          colorCount: palette.colors.length,
          activeTab: "generator",
          isCurrentPaletteSaved: true, // Loaded palettes are always saved
          isEditingMode: true, // Enter editing mode when loading a saved palette
          editingPaletteIndex: paletteIndex >= 0 ? paletteIndex : null, // Track which palette is being edited
          previousPalette: null,
          previousPaletteWasSaved: false,
          hasUndone: false,
          canUndo: false,
          canRedo: false,
        })
      },

      exitEditingMode: () => {
        set({
          isEditingMode: false,
          editingPaletteIndex: null,
          colorPalette: null,
          selectedImage: null,
          isCurrentPaletteSaved: false,
          previousPalette: null,
          previousPaletteWasSaved: false,
          hasUndone: false,
          canUndo: false,
          canRedo: false,
        })
      },

      downloadPalette: () => {
        const { colorPalette } = get()
        if (!colorPalette) return

        // Trigger bounce animation
        set({ downloadBounce: true })
        setTimeout(() => set({ downloadBounce: false }), 600)

        // Create CSS variables
        const cssContent = colorPalette.colors
          .map((color) => {
            return `--color-${color.name.toLowerCase().replace(/\s+/g, "-")}: ${
              color.hex
            };`
          })
          .join("\n")

        // Create download link
        const element = document.createElement("a")
        const file = new Blob([`:root {\n${cssContent}\n}`], {
          type: "text/css",
        })
        element.href = URL.createObjectURL(file)
        element.download = "color-palette.css"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)

        toast({
          title: "Downloaded!",
          description: "Color palette CSS variables downloaded",
        })
      },

      sharePalette: async () => {
        const { colorPalette } = get()
        if (!colorPalette) return

        const shareText = `Check out this color palette:\n${colorPalette.colors
          .map((c) => `${c.name}: ${c.hex}`)
          .join("\n")}`

        if (navigator.share) {
          try {
            await navigator.share({
              title: "Color Palette",
              text: shareText,
            })
          } catch (error) {
            console.error("Error sharing:", error)
            // Fallback to clipboard
            navigator.clipboard.writeText(shareText)
            toast({
              title: "Copied to clipboard",
              description: "Share text copied to clipboard",
            })
          }
        } else {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareText)
          toast({
            title: "Copied to clipboard",
            description: "Share text copied to clipboard",
          })
        }
      },

      isColorInPalette: (colors: ColorInfo[], hexToCheck: string): boolean => {
        return colors.some(
          (color) => color.hex.toLowerCase() === hexToCheck.toLowerCase()
        )
      },

      // Reset functions
      resetImageState: () => {
        set({
          selectedImage: null,
          colorPalette: null,
          isCurrentPaletteSaved: false,
          isEditingMode: false,
          editingPaletteIndex: null,
          previousPalette: null,
          previousPaletteWasSaved: false,
          hasUndone: false,
          canUndo: false,
          canRedo: false,
        })
      },

      clearCopiedColor: () => {
        set({ copiedColor: null })
      },

      // Auto-save function for editing mode
      autoSavePalette: async (palette: ColorPalette) => {
        const { savedPalettes, isEditingMode, editingPaletteIndex } = get()
        if (!isEditingMode) return

        try {
          // Create a storable version with compressed image
          const storablePalette = await createStorablePalette(palette)

          // Update the existing palette in place
          let newSavedPalettes = [...savedPalettes]

          if (
            editingPaletteIndex !== null &&
            editingPaletteIndex >= 0 &&
            editingPaletteIndex < newSavedPalettes.length
          ) {
            // Replace the specific palette being edited
            newSavedPalettes[editingPaletteIndex] = storablePalette
          } else {
            // Fallback: add as new palette if index is invalid
            newSavedPalettes = [storablePalette, ...newSavedPalettes].slice(
              0,
              10
            )
          }

          set({
            savedPalettes: newSavedPalettes,
            isCurrentPaletteSaved: true,
          })
        } catch (error) {
          console.error("Error auto-saving palette:", error)
          // Don't show error toast for auto-save failures
        }
      },
    }),
    {
      name: "color-palette-storage",
      // Only persist savedPalettes, not UI state or image data
      partialize: (state) => ({ savedPalettes: state.savedPalettes }),
      // Handle storage errors gracefully
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating storage:", error)
        }
      },
    }
  )
)
