"use client";

import type React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { generateColorPalette } from "./actions";
import { toast } from "@/components/ui/use-toast";
import { useColorPaletteStore } from "@/lib/store";

// Components
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { ColorPaletteDisplay } from "@/components/ColorPalette";
import { SavedPalettes } from "@/components/SavedPalettes";

export default function ColorPaletteGenerator() {
  // Zustand store
  const {
    selectedImage,
    colorCount,
    activeTab,
    setColorPalette,
    setIsLoading,
    setActiveTab,
  } = useColorPaletteStore();

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

  return (
    <>
      <Header />

      <main className="flex-1 flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsContent value="generator" className="flex-1 flex flex-col">
            <div className="flex-1 grid lg:grid-cols-[5fr_4fr]">
              {/* Upload Section */}
              <ImageUpload onGeneratePalette={generatePalette} />

              {/* Results Section */}
              <ColorPaletteDisplay />
            </div>
          </TabsContent>

          <TabsContent value="collection" className="flex-1">
            <SavedPalettes />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
