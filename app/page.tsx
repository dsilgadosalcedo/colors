"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Palette, Sparkles, Copy, Download, Check, ImageIcon, History, Trash2, Share2 } from "lucide-react"
import Image from "next/image"
import { generateColorPalette } from "./actions"
import { toast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ColorInfo {
  hex: string
  name: string
  description: string
}

interface ColorPalette {
  colors: ColorInfo[]
  dominantColor: string
  mood: string
  timestamp?: number
  imagePreview?: string
}

export default function ColorPaletteGenerator() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [savedPalettes, setSavedPalettes] = useLocalStorage<ColorPalette[]>("saved-palettes", [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [colorCount, setColorCount] = useState(6)
  const [activeTab, setActiveTab] = useState("generator")

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
      setColorPalette(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0])
    }
  }

  const generatePalette = async () => {
    if (!selectedImage) return

    setIsLoading(true)
    try {
      const result = await generateColorPalette(selectedImage, colorCount)
      const paletteWithTimestamp = {
        ...result,
        timestamp: Date.now(),
        imagePreview: selectedImage,
      }
      setColorPalette(paletteWithTimestamp)
    } catch (error) {
      console.error("Error generating palette:", error)
      toast({
        title: "Error",
        description: "Failed to generate color palette. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedColor(hex)
    toast({
      title: "Copied!",
      description: `${hex} copied to clipboard`,
      duration: 2000,
    })
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const savePalette = () => {
    if (!colorPalette) return

    setSavedPalettes((prev) => {
      // Check if palette already exists to avoid duplicates
      const exists = prev.some(
        (p) =>
          p.dominantColor === colorPalette.dominantColor &&
          p.colors.every((c, i) => c.hex === colorPalette.colors[i].hex),
      )

      if (exists) {
        toast({
          title: "Already saved",
          description: "This color palette is already in your collection",
        })
        return prev
      }

      toast({
        title: "Saved!",
        description: "Color palette added to your collection",
      })
      return [colorPalette, ...prev].slice(0, 10) // Keep only the 10 most recent
    })
  }

  const deleteSavedPalette = (index: number) => {
    setSavedPalettes((prev) => prev.filter((_, i) => i !== index))
    toast({
      title: "Deleted",
      description: "Color palette removed from your collection",
    })
  }

  const loadSavedPalette = (palette: ColorPalette) => {
    // Set the palette data
    setColorPalette(palette)

    // Set the image if available
    if (palette.imagePreview) {
      setSelectedImage(palette.imagePreview)
    }

    // Set the color count based on the palette
    setColorCount(palette.colors.length)

    // Switch to generator tab
    setActiveTab("generator")

    // Show success message
    toast({
      title: "Palette loaded!",
      description: "Switched to generator view with your selected palette",
    })
  }

  const downloadPalette = () => {
    if (!colorPalette) return

    // Create CSS variables
    const cssContent = colorPalette.colors
      .map((color, index) => {
        return `--color-${color.name.toLowerCase().replace(/\s+/g, "-")}: ${color.hex};`
      })
      .join("\n")

    // Create download link
    const element = document.createElement("a")
    const file = new Blob([`:root {\n${cssContent}\n}`], { type: "text/css" })
    element.href = URL.createObjectURL(file)
    element.download = "color-palette.css"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Downloaded!",
      description: "Color palette CSS variables downloaded",
    })
  }

  const sharePalette = async () => {
    if (!colorPalette) return

    const shareText = `Check out this color palette:\n${colorPalette.colors.map((c) => `${c.name}: ${c.hex}`).join("\n")}`

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
  }

  // Helper function to check if a color is already in the array
  const isColorInPalette = (colors: ColorInfo[], hexToCheck: string): boolean => {
    return colors.some((color) => color.hex.toLowerCase() === hexToCheck.toLowerCase())
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF2D55] to-[#FF9500] rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Color Palette Generator</h1>
            </div>

            {/* Custom Navigation Buttons in Header */}
            <div className="flex items-center">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("generator")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "generator" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Generator
                </button>
                <button
                  onClick={() => setActiveTab("collection")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "collection"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  My Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsContent value="generator" className="space-y-12">
            {/* Hero Section */}
            {!colorPalette && (
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                  Extract beautiful colors
                  <br />
                  <span className="bg-gradient-to-r from-[#FF2D55] to-[#FF9500] bg-clip-text text-transparent">
                    from any image
                  </span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Upload an image and let AI extract a beautiful color palette with intelligent color analysis.
                </p>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Upload Section */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-6">
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive ? "border-[#FF2D55] bg-red-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {selectedImage ? (
                        <div className="space-y-4">
                          <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-inner">
                            <Image
                              src={selectedImage || "/placeholder.svg"}
                              alt="Uploaded image"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSelectedImage(null)
                                setColorPalette(null)
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ""
                                }
                              }}
                            >
                              Change Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900 mb-1">Drop your image here</p>
                            <p className="text-gray-500 text-sm">or click to browse your files</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedImage && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Number of colors</label>
                          <Select
                            value={colorCount.toString()}
                            onValueChange={(value) => setColorCount(Number.parseInt(value))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
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
                      </div>
                    )}

                    {selectedImage && (
                      <div className="mt-6">
                        <Button
                          onClick={generatePalette}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-[#FF2D55] to-[#FF9500] hover:from-[#FF1D45] hover:to-[#FF8500] text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Analyzing Image...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Generate Color Palette
                            </div>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {colorPalette ? (
                  <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Color Palette</h3>
                          <p className="text-gray-600 text-sm">
                            Mood: <span className="font-medium">{colorPalette.mood}</span>
                          </p>
                        </div>

                        {/* Dominant Color */}
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 mb-2">Dominant Color</p>
                          <div className="flex flex-col items-center">
                            <div
                              className="w-16 h-16 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105 relative group"
                              style={{ backgroundColor: colorPalette.dominantColor }}
                              onClick={() => copyToClipboard(colorPalette.dominantColor)}
                            >
                              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-200">
                                {copiedColor === colorPalette.dominantColor ? (
                                  <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                                ) : (
                                  <Copy className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-mono">{colorPalette.dominantColor}</p>
                          </div>
                        </div>

                        {/* Color Grid */}
                        <div
                          className={`grid gap-4 ${colorPalette.colors.length <= 4 ? "grid-cols-2" : colorPalette.colors.length <= 6 ? "grid-cols-2" : "grid-cols-3"}`}
                        >
                          {colorPalette.colors.map((color, index) => (
                            <div
                              key={index}
                              className="group cursor-pointer"
                              onClick={() => copyToClipboard(color.hex)}
                            >
                              <div
                                className="w-full h-20 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-102 relative"
                                style={{ backgroundColor: color.hex }}
                              >
                                <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-200">
                                  {copiedColor === color.hex ? (
                                    <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                                  ) : (
                                    <Copy className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 text-center">
                                <p className="font-medium text-gray-900 text-sm">{color.name}</p>
                                <p className="text-xs text-gray-600 font-mono mt-0.5">{color.hex}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-tight line-clamp-2">
                                  {color.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={savePalette}
                          >
                            <Palette className="w-3.5 h-3.5" />
                            Save Palette
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={downloadPalette}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download CSS
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={sharePalette}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white h-full flex items-center justify-center">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Palette className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to extract colors</h3>
                      <p className="text-gray-500 text-sm">
                        Upload an image and generate a palette to see results here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collection" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Saved Palettes</h2>
              <p className="text-gray-600">Your collection of generated color palettes</p>
            </div>

            {savedPalettes.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {savedPalettes.map((palette, index) => (
                  <Card key={index} className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        {/* Image preview */}
                        {palette.imagePreview && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={palette.imagePreview || "/placeholder.svg"}
                              alt="Palette source"
                              width={80}
                              height={80}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-sm text-gray-900">
                                {new Date(palette.timestamp || Date.now()).toLocaleDateString()}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-1">{palette.mood}</p>
                              <p className="text-xs text-gray-400 mt-1">{palette.colors.length} colors</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => loadSavedPalette(palette)}
                                title="Load palette in generator"
                              >
                                <Palette className="h-3.5 w-3.5" />
                                <span className="sr-only">Load palette</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => deleteSavedPalette(index)}
                                title="Delete palette"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Delete palette</span>
                              </Button>
                            </div>
                          </div>

                          {/* Color swatches - clickable to load palette */}
                          <div
                            className="flex gap-1 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => loadSavedPalette(palette)}
                            title="Click to load this palette"
                          >
                            {/* Only show dominant color if it's not already in the palette colors */}
                            {!isColorInPalette(palette.colors, palette.dominantColor) && (
                              <div
                                className="w-6 h-6 rounded-full ring-1 ring-inset ring-gray-200"
                                style={{ backgroundColor: palette.dominantColor }}
                              />
                            )}

                            {/* Show palette colors */}
                            {palette.colors.slice(0, 5).map((color, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full ring-1 ring-inset ring-gray-200"
                                style={{ backgroundColor: color.hex }}
                              />
                            ))}

                            {/* Show "more" indicator if there are more than 5 colors */}
                            {palette.colors.length > 5 && (
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 ring-1 ring-inset ring-gray-200">
                                +{palette.colors.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved palettes yet</h3>
                  <p className="text-gray-500 mb-4">Generate and save color palettes to build your collection</p>
                  <Button variant="outline" onClick={() => setActiveTab("generator")}>
                    Create Your First Palette
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
