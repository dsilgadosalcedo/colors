"use client";

import type React from "react";
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { generateColorPalette } from "./actions";
import { toast } from "@/components/ui/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ColorInfo, ColorPalette } from "@/lib/types";

// Components
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { ColorPaletteDisplay } from "@/components/ColorPalette";
import { SavedPalettes } from "@/components/SavedPalettes";

export default function ColorPaletteGenerator() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [savedPalettes, setSavedPalettes] = useLocalStorage<ColorPalette[]>(
    "saved-palettes",
    []
  );
  const [colorCount, setColorCount] = useState(3);
  const [activeTab, setActiveTab] = useState("generator");

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setColorPalette(null);
    };
    reader.readAsDataURL(file);
  };

  const generatePalette = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const result = await generateColorPalette(selectedImage, colorCount);
      const paletteWithTimestamp = {
        ...result,
        timestamp: Date.now(),
        imagePreview: selectedImage,
      };
      setColorPalette(paletteWithTimestamp);
    } catch (error) {
      console.error("Error generating palette:", error);
      toast({
        title: "Error",
        description: "Failed to generate color palette. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast({
      title: "Copied!",
      description: `${hex} copied to clipboard`,
      duration: 2000,
    });
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const savePalette = () => {
    if (!colorPalette) return;

    setSavedPalettes((prev) => {
      // Check if palette already exists to avoid duplicates
      const exists = prev.some(
        (p) =>
          p.dominantColor === colorPalette.dominantColor &&
          p.colors.every((c, i) => c.hex === colorPalette.colors[i].hex)
      );

      if (exists) {
        toast({
          title: "Already saved",
          description: "This color palette is already in your collection",
        });
        return prev;
      }

      toast({
        title: "Saved!",
        description: "Color palette added to your collection",
      });
      return [colorPalette, ...prev].slice(0, 10); // Keep only the 10 most recent
    });
  };

  const deleteSavedPalette = (index: number) => {
    setSavedPalettes((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Deleted",
      description: "Color palette removed from your collection",
    });
  };

  const loadSavedPalette = (palette: ColorPalette) => {
    // Set the palette data
    setColorPalette(palette);

    // Set the image if available
    if (palette.imagePreview) {
      setSelectedImage(palette.imagePreview);
    }

    // Set the color count based on the palette
    setColorCount(palette.colors.length);

    // Switch to generator tab
    setActiveTab("generator");

    // Show success message
    toast({
      title: "Palette loaded!",
      description: "Switched to generator view with your selected palette",
    });
  };

  const downloadPalette = () => {
    if (!colorPalette) return;

    // Create CSS variables
    const cssContent = colorPalette.colors
      .map((color, index) => {
        return `--color-${color.name.toLowerCase().replace(/\s+/g, "-")}: ${
          color.hex
        };`;
      })
      .join("\n");

    // Create download link
    const element = document.createElement("a");
    const file = new Blob([`:root {\n${cssContent}\n}`], { type: "text/css" });
    element.href = URL.createObjectURL(file);
    element.download = "color-palette.css";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Downloaded!",
      description: "Color palette CSS variables downloaded",
    });
  };

  const sharePalette = async () => {
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
  };

  // Helper function to check if a color is already in the array
  const isColorInPalette = (
    colors: ColorInfo[],
    hexToCheck: string
  ): boolean => {
    return colors.some(
      (color) => color.hex.toLowerCase() === hexToCheck.toLowerCase()
    );
  };

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsContent value="generator" className="flex-1 flex flex-col">
            <div className="flex-1 grid lg:grid-cols-2">
              {/* Upload Section */}
              <ImageUpload
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                setColorPalette={setColorPalette}
                dragActive={dragActive}
                setDragActive={setDragActive}
                colorCount={colorCount}
                setColorCount={setColorCount}
                isLoading={isLoading}
                onGeneratePalette={generatePalette}
                onImageUpload={handleImageUpload}
              />

              {/* Results Section */}
              <ColorPaletteDisplay
                colorPalette={colorPalette}
                copiedColor={copiedColor}
                onCopyColor={copyToClipboard}
                onSavePalette={savePalette}
                onDownloadPalette={downloadPalette}
                onSharePalette={sharePalette}
              />
            </div>
          </TabsContent>

          <TabsContent value="collection" className="flex-1">
            <SavedPalettes
              savedPalettes={savedPalettes}
              onLoadPalette={loadSavedPalette}
              onDeletePalette={deleteSavedPalette}
              onSwitchToGenerator={() => setActiveTab("generator")}
              isColorInPalette={isColorInPalette}
            />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
