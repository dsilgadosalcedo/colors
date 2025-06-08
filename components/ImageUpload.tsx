import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useColorPaletteStore } from "@/lib/store";

interface ImageUploadProps {
  onGeneratePalette: () => void;
}

export function ImageUpload({ onGeneratePalette }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedImage,
    dragActive,
    colorCount,
    isLoading,
    setSelectedImage,
    setColorPalette,
    setDragActive,
    setColorCount,
    handleImageUpload,
    resetImageState,
  } = useColorPaletteStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleChangeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resetImageState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="relative flex flex-col justify-center gap-6 backdrop-blur-md"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          Extract beautiful colors
          <br />
          <span className="bg-gradient-to-r from-[#9438D2] via-[#FFB300] to-[#FFA3D1] bg-clip-text text-transparent">
            from any image
          </span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed text-balance">
          Upload an image and let AI extract a beautiful color palette with
          intelligent color analysis.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      <Image
        src={selectedImage || "/placeholder.svg"}
        alt="Uploaded image"
        fill
        className={cn(
          "absolute top-0 left-0 object-cover -z-10 mask-r-from-30% blur-sm",
          selectedImage ? "opacity-40" : "opacity-0"
        )}
      />

      {selectedImage ? (
        <div className="grid place-items-center gap-4 z-20">
          <Button variant="outline" size="sm" onClick={handleChangeImage}>
            Change Image
          </Button>
        </div>
      ) : (
        <div className="grid place-items-center gap-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              Drop your image here
            </p>
            <p className="text-gray-500 text-sm">
              or click to browse your files
            </p>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="grid place-items-center mt-4 z-20">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="color-count"
              className="text-sm font-medium text-gray-700"
            >
              Number of colors
            </Label>
            <Select
              value={colorCount.toString()}
              onValueChange={(value) => setColorCount(Number.parseInt(value))}
            >
              <SelectTrigger id="color-count" className="w-20">
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
        <div className="mt-6 mx-20 z-20">
          <Button
            onClick={onGeneratePalette}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#9438D2]  to-[#FFA3D1] hover:to-[#FFB300] text-white transition-all duration-200"
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
    </div>
  );
}
