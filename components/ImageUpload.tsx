import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Sparkles, Paperclip, Send } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useColorPaletteStore } from "@/lib/store";

interface ImageUploadProps {
  onGeneratePalette: (userPrompt?: string) => void;
}

// Example prompts for when there's no image (text-only palette generation)
const NO_IMAGE_EXAMPLES = [
  "Create a warm autumn palette with golden and crimson tones",
  "Generate ocean blues with seafoam and coral accents",
  "Design a vintage 1970s color scheme",
  "Make a minimalist palette with soft pastels",
  "Create a bold neon cyberpunk color combination",
  "Generate earthy forest colors for a nature brand",
  "Design a luxury gold and black palette",
  "Create sunset colors with pink and orange gradients",
  "Make a calming spa palette with greens and whites",
  "Generate 5 colors inspired by cherry blossoms",
  "Create a desert landscape color scheme",
  "Design a modern tech brand palette",
  "Make a cozy winter cabin color combination",
  "Generate vibrant tropical fruit colors",
  "Create a sophisticated wine bar palette",
  "Design colors for a children's playroom",
  "Make a vintage denim and leather palette",
  "Generate arctic tundra inspired colors",
  "Create a bohemian festival color scheme",
  "Design a corporate professional palette",
  "Make a retro 80s neon color combination",
  "Generate soft morning mist colors",
  "Create a spicy Mexican cuisine palette",
  "Design colors inspired by gemstones",
  "Make a peaceful zen garden color scheme",
  "Generate colors from a lavender field",
  "Create a dramatic gothic color palette",
  "Design bright carnival celebration colors",
  "Make a subtle French countryside palette",
  "Generate colors inspired by Japanese art",
  "Create a fresh spring garden color scheme",
  "Design a warm coffee shop palette",
  "Make colors inspired by Northern Lights",
  "Generate a beachy coastal color combination",
  "Create a sophisticated art gallery palette",
  "Design colors for a wellness brand",
  "Make a bold street art color scheme",
  "Generate soft romantic wedding colors",
  "Create a modern apartment color palette",
  "Design colors inspired by precious metals",
];

// Example prompts for when there's an image (specifications for analysis)
const WITH_IMAGE_EXAMPLES = [
  "Don't include background colors",
  "Focus on warm tones only",
  "Ignore the text and focus on objects",
  "Extract only the most vibrant colors",
  "Prioritize colors from the center of the image",
  "Skip any white or black areas",
  "Focus on the main subject, ignore the background",
  "Extract muted and subtle tones",
  "Only include colors that appear prominently",
  "Avoid any gray or neutral colors",
  "Focus on the lighting and shadow colors",
  "Extract colors from clothing or fabric only",
  "Prioritize natural colors over artificial ones",
  "Focus on the sky colors in the image",
  "Extract colors from plants or nature elements",
  "Ignore any metallic or reflective surfaces",
  "Focus on skin tones and human elements",
  "Extract colors from the foreground only",
  "Prioritize colors that complement each other",
  "Focus on the emotional mood of the colors",
  "Extract colors from architectural elements",
  "Ignore any branding or logo colors",
  "Focus on the most saturated colors",
  "Extract colors from water or liquid elements",
  "Prioritize colors from the left side of the image",
  "Focus on colors that create contrast",
  "Extract colors from food or organic elements",
  "Ignore any monochrome or grayscale areas",
  "Focus on colors from the bottom third",
  "Extract colors that would work for a brand palette",
];

export function ImageUpload({ onGeneratePalette }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [currentExample, setCurrentExample] = useState(NO_IMAGE_EXAMPLES[0]);

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

  // Rotate examples every 10 seconds based on whether there's an image
  useEffect(() => {
    const getRandomExample = () => {
      const examples = selectedImage ? WITH_IMAGE_EXAMPLES : NO_IMAGE_EXAMPLES;
      const randomIndex = Math.floor(Math.random() * examples.length);
      return examples[randomIndex];
    };

    // Set initial example based on current state
    setCurrentExample(getRandomExample());

    const interval = setInterval(() => {
      setCurrentExample(getRandomExample());
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedImage]); // Re-run when selectedImage changes

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

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleGenerate = () => {
    onGeneratePalette(userPrompt.trim() || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleExampleClick = () => {
    setUserPrompt(currentExample);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div
      className="animate-in fade-in-30 duration-200 relative gap-6 backdrop-blur-md grid place-content-center place-items-center py-10 lg:py-0 lg:mb-7"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-background leading-tight tracking-tight">
          Create beautiful colors
        </h2>
        <p className="text-lg text-[#77d9ab] max-w-2xl mx-auto leading-relaxed text-balance">
          Upload an image or describe what you want
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      <div
        className={cn(
          "w-full h-full mx-6 rounded-3xl absolute top-0 left-0 object-cover -z-10 mask-r-from-30% blur-sm transition-all duration-300",
          selectedImage ? "opacity-20" : "bg-[#50b1d8] opacity-10"
        )}
      >
        <Image
          src={selectedImage || "/placeholder.svg"}
          alt="Uploaded image"
          fill
          className="object-cover mask-r-from-30%"
        />
      </div>

      {selectedImage && (
        <Image
          src={selectedImage || "/placeholder.svg"}
          alt="Uploaded image"
          width={100}
          height={100}
          className="hidden md:block absolute top-4 left-10 object-cover rounded-lg shadow-md animate-in fade-in-30 duration-200"
        />
      )}

      {/* Main Content Area */}
      <section className="bottom-8 absolute left-1/2 -translate-x-1/2 mx-auto px-6">
        <div>
          {/* Example Prompt */}
          {!userPrompt.trim() ? (
            <div className="mb-3 text-center">
              <Button
                variant="outline"
                onClick={handleExampleClick}
                className="text-[#77d9ab] hover:text-[#77d9ab] text-sm transition-colors cursor-pointer bg-transparent hover:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-[#77d9ab]/30 hover:border-[#189258]/50"
                disabled={isLoading}
              >
                {currentExample}
              </Button>
            </div>
          ) : null}

          {/* Text Input Area */}
          <div className="backdrop-blur-sm rounded-3xl bg-[#0a3922] p-3 relative w-140">
            <Textarea
              ref={textareaRef}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedImage ? "Add specifications" : "Describe your palette"
              }
              className="resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 min-h-[28px] bg-transparent text-background text-lg font-medium border-none placeholder:text-[#77d9ab]"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between gap-4 mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleUploadClick}
                disabled={isLoading}
                className="bg-transparent text-[#77d9ab] rounded-full hover:bg-[#FFC857] hover:text-[#133541] border-[#FFC857] hover:border-[#FFC857]"
              >
                <Paperclip />
              </Button>

              <div className="flex items-center justify-center gap-2">
                {/* Color Count Selector */}
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="color-count"
                    className="text-sm font-medium text-[#77d9ab]"
                  >
                    Number of colors
                  </Label>
                  <Select
                    value={colorCount.toString()}
                    onValueChange={(value) =>
                      setColorCount(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger
                      id="color-count"
                      className="w-20 h-10 text-xs p-2 bg-transparent text-background"
                    >
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

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleGenerate}
                  disabled={isLoading || (!selectedImage && !userPrompt.trim())}
                  className="text-[#133541] rounded-full bg-[#FFC857] hover:bg-[#FFC857] hover:text-[#133541] disabled:bg-[#50b1d8] disabled:text-[#133541] disabled:opacity-100"
                >
                  <Send />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
