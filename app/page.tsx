"use client";

import type React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { generateColorPalette } from "./actions";
import { toast } from "@/components/ui/use-toast";
import { useColorPaletteStore } from "@/lib/store";
import { useRef } from "react";

// Components
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { ColorPaletteDisplay } from "@/components/ColorPalette";
import { SavedPalettes } from "@/components/SavedPalettes";
import { DragOverlay } from "@/components/DragOverlay";

export default function ColorPaletteGenerator() {
  const dragCounter = useRef(0);

  // Zustand store
  const {
    selectedImage,
    colorCount,
    activeTab,
    pageDragActive,
    setColorPalette,
    setIsLoading,
    setActiveTab,
    setPageDragActive,
    handleImageUpload,
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

  // Page-level drag handlers
  const handlePageDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle page-level drag when on generator tab
    if (activeTab !== "generator") return;

    dragCounter.current++;
    if (dragCounter.current === 1) {
      setPageDragActive(true);
    }
  };

  const handlePageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle page-level drag when on generator tab
    if (activeTab !== "generator") return;

    dragCounter.current--;
    if (dragCounter.current === 0) {
      setPageDragActive(false);
    }
  };

  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle page-level drag when on generator tab
    if (activeTab !== "generator") return;
  };

  const handlePageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle page-level drag when on generator tab
    if (activeTab !== "generator") return;

    dragCounter.current = 0;
    setPageDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleImageUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
      }
    }
  };

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

        {/* Drag Overlay - only show when generator tab is active */}
        <DragOverlay isVisible={pageDragActive && activeTab === "generator"} />
      </main>
    </>
  );
}
