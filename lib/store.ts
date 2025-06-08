import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ColorInfo, ColorPalette } from "./types";
import { toast } from "@/components/ui/use-toast";

interface ColorPaletteState {
  // UI State
  selectedImage: string | null;
  colorPalette: ColorPalette | null;
  isLoading: boolean;
  dragActive: boolean;
  copiedColor: string | null;
  colorCount: number;
  activeTab: string;

  // Persisted State
  savedPalettes: ColorPalette[];

  // Actions
  setSelectedImage: (image: string | null) => void;
  setColorPalette: (palette: ColorPalette | null) => void;
  setIsLoading: (loading: boolean) => void;
  setDragActive: (active: boolean) => void;
  setCopiedColor: (color: string | null) => void;
  setColorCount: (count: number) => void;
  setActiveTab: (tab: string) => void;

  // Business Logic Actions
  handleImageUpload: (file: File) => void;
  copyToClipboard: (hex: string) => void;
  savePalette: () => void;
  deleteSavedPalette: (index: number) => void;
  loadSavedPalette: (palette: ColorPalette) => void;
  downloadPalette: () => void;
  sharePalette: () => Promise<void>;
  isColorInPalette: (colors: ColorInfo[], hexToCheck: string) => boolean;

  // Reset functions
  resetImageState: () => void;
  clearCopiedColor: () => void;
}

export const useColorPaletteStore = create<ColorPaletteState>()(
  persist(
    (set, get) => ({
      // Initial State
      selectedImage: null,
      colorPalette: null,
      isLoading: false,
      dragActive: false,
      copiedColor: null,
      colorCount: 3,
      activeTab: "generator",
      savedPalettes: [],

      // Basic Setters
      setSelectedImage: (image) => set({ selectedImage: image }),
      setColorPalette: (palette) => set({ colorPalette: palette }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setDragActive: (active) => set({ dragActive: active }),
      setCopiedColor: (color) => set({ copiedColor: color }),
      setColorCount: (count) => set({ colorCount: count }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Business Logic Actions
      handleImageUpload: (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          set({
            selectedImage: e.target?.result as string,
            colorPalette: null,
          });
        };
        reader.readAsDataURL(file);
      },

      copyToClipboard: (hex: string) => {
        navigator.clipboard.writeText(hex);
        set({ copiedColor: hex });
        toast({
          title: "Copied!",
          description: `${hex} copied to clipboard`,
          duration: 2000,
        });
        setTimeout(() => {
          set({ copiedColor: null });
        }, 2000);
      },

      savePalette: () => {
        const { colorPalette, savedPalettes } = get();
        if (!colorPalette) return;

        // Check if palette already exists to avoid duplicates
        const exists = savedPalettes.some(
          (p) =>
            p.dominantColor === colorPalette.dominantColor &&
            p.colors.every((c, i) => c.hex === colorPalette.colors[i].hex)
        );

        if (exists) {
          toast({
            title: "Already saved",
            description: "This color palette is already in your collection",
          });
          return;
        }

        const newSavedPalettes = [colorPalette, ...savedPalettes].slice(0, 10);
        set({ savedPalettes: newSavedPalettes });

        toast({
          title: "Saved!",
          description: "Color palette added to your collection",
        });
      },

      deleteSavedPalette: (index: number) => {
        const { savedPalettes } = get();
        const newSavedPalettes = savedPalettes.filter((_, i) => i !== index);
        set({ savedPalettes: newSavedPalettes });

        toast({
          title: "Deleted",
          description: "Color palette removed from your collection",
        });
      },

      loadSavedPalette: (palette: ColorPalette) => {
        set({
          colorPalette: palette,
          selectedImage: palette.imagePreview || null,
          colorCount: palette.colors.length,
          activeTab: "generator",
        });

        toast({
          title: "Palette loaded!",
          description: "Switched to generator view with your selected palette",
        });
      },

      downloadPalette: () => {
        const { colorPalette } = get();
        if (!colorPalette) return;

        // Create CSS variables
        const cssContent = colorPalette.colors
          .map((color) => {
            return `--color-${color.name.toLowerCase().replace(/\s+/g, "-")}: ${
              color.hex
            };`;
          })
          .join("\n");

        // Create download link
        const element = document.createElement("a");
        const file = new Blob([`:root {\n${cssContent}\n}`], {
          type: "text/css",
        });
        element.href = URL.createObjectURL(file);
        element.download = "color-palette.css";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        toast({
          title: "Downloaded!",
          description: "Color palette CSS variables downloaded",
        });
      },

      sharePalette: async () => {
        const { colorPalette } = get();
        if (!colorPalette) return;

        const shareText = `Check out this color palette:\n${colorPalette.colors
          .map((c) => `${c.name}: ${c.hex}`)
          .join("\n")}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: "Color Palette",
              text: shareText,
            });
          } catch (error) {
            console.error("Error sharing:", error);
            // Fallback to clipboard
            navigator.clipboard.writeText(shareText);
            toast({
              title: "Copied to clipboard",
              description: "Share text copied to clipboard",
            });
          }
        } else {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareText);
          toast({
            title: "Copied to clipboard",
            description: "Share text copied to clipboard",
          });
        }
      },

      isColorInPalette: (colors: ColorInfo[], hexToCheck: string): boolean => {
        return colors.some(
          (color) => color.hex.toLowerCase() === hexToCheck.toLowerCase()
        );
      },

      // Reset functions
      resetImageState: () => {
        set({
          selectedImage: null,
          colorPalette: null,
        });
      },

      clearCopiedColor: () => {
        set({ copiedColor: null });
      },
    }),
    {
      name: "color-palette-storage",
      // Only persist savedPalettes, not UI state
      partialize: (state) => ({ savedPalettes: state.savedPalettes }),
    }
  )
);
