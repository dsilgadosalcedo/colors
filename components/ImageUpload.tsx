import React, { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Paperclip, Send, Plus } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useColorPaletteStore } from "@/lib/store"
import { Switch } from "./ui/switch"
import { Card } from "./ui/card"
// GSAP will be dynamically imported on client side only

interface ImageUploadProps {
  onGeneratePalette: (userPrompt?: string) => void
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
]

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
]

// Example prompts for editing existing palettes
const EDITING_EXAMPLES = [
  "Add a warm red color to the palette",
  "Make the third color darker",
  "Change the primary color to blue",
  "Replace the green with a forest green",
  "Add a complementary color to the orange",
  "Make all colors more vibrant",
  "Soften the bright colors",
  "Add a neutral gray color",
  "Remove the yellow and add purple instead",
  "Make the palette more pastel",
  "Increase the saturation of all colors",
  "Add a color that matches the sky",
  "Replace the pink with a coral shade",
  "Make the palette warmer overall",
  "Add a deep navy blue",
  "Change the brown to a chocolate brown",
  "Add a mint green color",
  "Make the red more burgundy",
  "Add a color for text readability",
  "Replace the lightest color with white",
  "Add a golden yellow accent",
  "Make the purple more royal",
  "Add an earthy tone",
  "Change the primary to a teal color",
  "Add a soft pink for highlights",
  "Make the palette more monochromatic",
  "Add a contrasting accent color",
  "Replace the orange with a peach",
  "Add a charcoal color for depth",
  "Make all colors slightly desaturated",
]

export function ImageUpload({ onGeneratePalette }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const exampleTextRef = useRef<HTMLSpanElement>(null)
  const [userPrompt, setUserPrompt] = useState("")
  const [currentExample, setCurrentExample] = useState(NO_IMAGE_EXAMPLES[0])
  const [loadingText, setLoadingText] = useState("")
  const [wasGenerating, setWasGenerating] = useState(false)
  const [isAnimatingExample, setIsAnimatingExample] = useState(false)

  const {
    selectedImage,
    dragActive,
    colorCount,
    isLoading,
    isEditingMode,
    colorTextPreview,
    isColorTextPreviewMode,
    colorPalette,
    setSelectedImage,
    setColorPalette,
    setDragActive,
    setColorCount,
    handleImageUpload,
    resetImageState,
    exitEditingMode,
    autoSavePalette,
  } = useColorPaletteStore()

  // Animated example transition function
  const animateToNewExample = async (newExample: string) => {
    if (
      !exampleTextRef.current ||
      isAnimatingExample ||
      newExample === currentExample
    )
      return

    setIsAnimatingExample(true)
    simulateTypingTransition(currentExample, newExample)
  }

  const simulateTypingTransition = (oldText: string, newText: string) => {
    let currentText = oldText
    let phase: "backspacing" | "typing" = "backspacing"
    let showCursor = true

    // Cursor blinking interval
    const cursorInterval = setInterval(() => {
      showCursor = !showCursor
      setCurrentExample(currentText + (showCursor ? "|" : ""))
    }, 500)

    const processNextStep = () => {
      if (phase === "backspacing") {
        if (currentText.length > 0) {
          // Remove character (backspace)
          currentText = currentText.slice(0, -1)
          setCurrentExample(currentText + "|")

          // Variable backspace speed - faster than typing
          const delay = 30 + Math.random() * 40 // 30-70ms per backspace
          setTimeout(processNextStep, delay)
        } else {
          // Done backspacing, start typing
          phase = "typing"
          // Pause before starting to type
          setTimeout(processNextStep, 200 + Math.random() * 300)
        }
      } else {
        // Typing phase
        if (currentText.length < newText.length) {
          // Add next character
          currentText += newText[currentText.length]
          setCurrentExample(currentText + "|")

          // Variable typing speed - more realistic
          let delay = 60 + Math.random() * 120 // Base 60-180ms per character

          // Add longer pauses after punctuation and spaces
          const char = currentText[currentText.length - 1]
          if (char === " ") delay += Math.random() * 100
          if (char === "," || char === ".") delay += Math.random() * 200
          if (char === "\n") delay += Math.random() * 300

          // Occasionally add hesitation
          if (Math.random() < 0.1) delay += Math.random() * 300

          setTimeout(processNextStep, delay)
        } else {
          // Typing complete
          clearInterval(cursorInterval)
          setCurrentExample(newText)
          setIsAnimatingExample(false)
        }
      }
    }

    // Start the process after a brief delay
    setTimeout(processNextStep, 300)
  }

  // Rotate examples every 10 seconds based on current mode
  useEffect(() => {
    const getRandomExample = () => {
      let examples
      if (isEditingMode) {
        examples = EDITING_EXAMPLES
      } else if (selectedImage) {
        examples = WITH_IMAGE_EXAMPLES
      } else {
        examples = NO_IMAGE_EXAMPLES
      }
      const randomIndex = Math.floor(Math.random() * examples.length)
      return examples[randomIndex]
    }

    // Set initial example based on current state
    const initialExample = getRandomExample()
    setCurrentExample(initialExample)

    const interval = setInterval(() => {
      // Only animate if not currently animating
      if (!isAnimatingExample) {
        const newExample = getRandomExample()
        animateToNewExample(newExample)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [selectedImage, isEditingMode]) // Removed isAnimatingExample dependency to prevent re-runs

  // Handle loading animation
  useEffect(() => {
    if (isLoading) {
      const baseText = isEditingMode
        ? "Editing your palette"
        : "Generating palette"
      let dotCount = 0

      const interval = setInterval(() => {
        dotCount = (dotCount + 1) % 4
        setLoadingText(baseText + ".".repeat(dotCount))
      }, 500)

      return () => clearInterval(interval)
    } else {
      setLoadingText("")
      // Clear prompt only if we were generating/editing (not saving)
      if (wasGenerating) {
        setUserPrompt("")
        setWasGenerating(false)
      }
    }
  }, [isLoading, isEditingMode, wasGenerating])

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

    if (e.dataTransfer.files && e.dataTransfer.files[0] && !isEditingMode) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && !isEditingMode) {
      handleImageUpload(e.target.files[0])
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleGenerate = () => {
    setWasGenerating(true) // Mark that we're generating/editing
    onGeneratePalette(userPrompt.trim() || undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const handleExampleClick = () => {
    if (!textareaRef.current || !exampleTextRef.current || isAnimatingExample)
      return

    setIsAnimatingExample(true)

    // Focus textarea and start realistic typing
    setUserPrompt("")
    textareaRef.current?.focus()
    simulateRealisticTyping(currentExample)
  }

  const simulateRealisticTyping = (text: string) => {
    let currentText = ""
    let currentIndex = 0
    let showCursor = true

    // Cursor blinking interval
    const cursorInterval = setInterval(() => {
      showCursor = !showCursor
      if (currentIndex <= text.length) {
        setUserPrompt(currentText + (showCursor ? "|" : ""))
      }
    }, 500)

    const typeNextCharacter = () => {
      if (currentIndex >= text.length) {
        // Typing complete - remove cursor and finish
        clearInterval(cursorInterval)
        setUserPrompt(text)
        setIsAnimatingExample(false)
        return
      }

      // Add next character
      currentText += text[currentIndex]
      currentIndex++
      setUserPrompt(currentText + "|")

      // Calculate next typing delay - vary speed for realism
      let delay = 50 + Math.random() * 100 // Base 50-150ms per character

      // Add longer pauses after punctuation and spaces for realism
      const char = text[currentIndex - 1]
      if (char === " ") delay += Math.random() * 100 // Extra pause after space
      if (char === "," || char === ".") delay += Math.random() * 200 // Longer pause after punctuation
      if (char === "\n") delay += Math.random() * 300 // Even longer pause after line break

      // Occasionally add slight hesitation (like thinking)
      if (Math.random() < 0.1) delay += Math.random() * 300

      // Schedule next character
      setTimeout(typeNextCharacter, delay)
    }

    // Start typing after a short delay
    setTimeout(typeNextCharacter, 200)
  }

  const handleAddColorText = (colorName: string) => {
    const textToAdd = `"${colorName}" color`
    const newPrompt = userPrompt.trim()
      ? `${userPrompt} ${textToAdd}`
      : textToAdd
    setUserPrompt(newPrompt)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleRemoveImage = async () => {
    if (isEditingMode && colorPalette) {
      // In editing mode: remove image from palette and auto-save
      const updatedPalette = {
        ...colorPalette,
        imagePreview: undefined,
      }
      setColorPalette(updatedPalette)
      setSelectedImage(null)
      // Auto-save the palette without the image
      await autoSavePalette(updatedPalette)
    } else {
      // In creation mode: just remove the image from input
      setSelectedImage(null)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Listen for custom events from ColorCard components
  useEffect(() => {
    const handleAddColorTextEvent = (event: CustomEvent) => {
      const { colorName } = event.detail
      handleAddColorText(colorName)
    }

    window.addEventListener(
      "addColorText",
      handleAddColorTextEvent as EventListener
    )

    return () => {
      window.removeEventListener(
        "addColorText",
        handleAddColorTextEvent as EventListener
      )
    }
  }, [userPrompt])

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
        <h2 className="text-4xl font-bold leading-tight tracking-tight">
          {isEditingMode ? "Edit your palette" : "Create beautiful colors"}
        </h2>
        <p
          className={cn(
            "text-lg text-muted-foreground md:max-w-2xl mx-auto leading-relaxed text-balance mt-6 md:mt-0",
            isEditingMode ? "max-w-sm" : "max-w-xs"
          )}
        >
          {isEditingMode
            ? "Describe changes you want to make to your palette"
            : "Upload an image or describe what you want"}
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
          "w-full h-[calc(100%+24px)] md:h-full md:mx-6 md:rounded-3xl absolute top-0 left-0 object-cover -z-10 duration-200 overflow-hidden",
          selectedImage
            ? "opacity-40 blur-sm"
            : "bg-gradient-to-b lg:bg-gradient-to-r from-secondary via-muted-foreground to-transparent opacity-20"
        )}
      >
        <Image
          src={selectedImage || "/placeholder.svg"}
          alt="Uploaded image"
          fill
          className="object-cover mask-b-from-30% lg:mask-b-from-100% lg:mask-r-from-30% data-[state=show]:animate-in data-[state=hide]:animate-out fade-in fade-out duration-300 data-[state=show]:blur-none data-[state=hide]:blur-lg data-[state=hide]:opacity-0"
          data-state={selectedImage ? "show" : "hide"}
        />
      </div>

      <div
        className="flex gap-2 group absolute top-4 left-4 md:left-10 data-[state=show]:animate-in data-[state=hide]:animate-out fade-in fade-out duration-200 data-[state=show]:blur-none data-[state=hide]:blur-lg data-[state=hide]:opacity-0"
        data-state={selectedImage ? "show" : "hide"}
      >
        <Image
          src={selectedImage || "/placeholder.svg"}
          alt="Uploaded image"
          width={100}
          height={100}
          className="object-cover rounded-lg shadow-md hidden md:block"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveImage}
          disabled={isLoading}
        >
          <span className="hidden md:block">Remove</span>
          <span className="block md:hidden">Remove image</span>
        </Button>
      </div>

      {!!colorPalette && (
        <Button
          variant="outline"
          size="icon"
          onClick={exitEditingMode}
          className="absolute top-4 md:right-10 right-4 bg-transparent text-muted-foreground hover:bg-ring hover:text-secondary-foreground border-ring hover:border-ring disabled:border-secondary disabled:cursor-not-allowed disabled:opacity-100"
        >
          <Plus />
        </Button>
      )}

      {/* Main Content Area */}
      <section className="-bottom-14 md:bottom-8 relative md:absolute md:left-1/2 md:-translate-x-1/2 md:px-6 w-[calc(100%-32px)] md:w-auto">
        {/* Example Prompt */}
        {!userPrompt.trim() ? (
          <div className="mb-3 text-center max-w-[calc(100vw-32px)]">
            <Button
              variant="outline"
              onClick={handleExampleClick}
              className="bg-transparent max-w-full text-sm transition-all cursor-pointer backdrop-blur-sm px-4 py-2 hover:scale-105 active:scale-95 duration-200"
              disabled={isLoading || isAnimatingExample}
              aria-label="Example prompt"
            >
              <span ref={exampleTextRef} className="inline-block">
                {currentExample}
              </span>
            </Button>
          </div>
        ) : null}

        {/* Text Input Area */}
        <Card className="backdrop-blur-sm p-3 relative md:w-140 border-none">
          <Textarea
            ref={textareaRef}
            value={
              isLoading
                ? loadingText
                : isColorTextPreviewMode
                ? `${userPrompt}${
                    userPrompt.trim() ? " " : ""
                  }${colorTextPreview}`
                : userPrompt
            }
            onChange={(e) =>
              !isLoading &&
              !isColorTextPreviewMode &&
              setUserPrompt(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={
              isEditingMode
                ? "Edit your palette"
                : selectedImage
                ? "Add specifications"
                : "Describe your palette"
            }
            className={cn(
              "resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 min-h-[28px] text-lg font-medium border-none rounded-none",
              isColorTextPreviewMode && "text-muted-foreground"
            )}
            disabled={isLoading}
            readOnly={isLoading || isColorTextPreviewMode}
          />

          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleUploadClick}
                disabled={isLoading || isEditingMode}
                className="bg-transparent text-muted-foreground hover:bg-ring hover:text-secondary-foreground border-ring hover:border-ring disabled:border-secondary disabled:cursor-not-allowed disabled:opacity-100"
              >
                <Paperclip />
              </Button>
              <Switch
                id="editing"
                checked={isEditingMode}
                onCheckedChange={(checked) => {
                  if (!checked && isEditingMode) {
                    exitEditingMode()
                  }
                }}
                disabled={!isEditingMode}
                className="data-[state=checked]:bg-ring data-[state=unchecked]:bg-transparent border border-ring w-14 disabled:border-secondary disabled:cursor-not-allowed disabled:opacity-100 rounded-md"
              />
              <Label htmlFor="editing" className="text-card-foreground">
                Editing
              </Label>
            </div>

            <div className="flex items-center justify-center gap-2">
              {/* Color Count Selector */}
              <div className="flex items-center justify-between gap-2">
                <Label
                  htmlFor="color-count"
                  className="text-sm font-medium text-card-foreground"
                >
                  <span className="hidden md:block">Number of colors</span>
                  <span className="block md:hidden">Colors</span>
                </Label>
                <Select
                  value={colorCount.toString()}
                  onValueChange={(value) =>
                    setColorCount(Number.parseInt(value))
                  }
                  disabled={isLoading || isEditingMode}
                >
                  <SelectTrigger
                    id="color-count"
                    className="w-20 h-10 text-xs p-2 rounded-md"
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
                variant="accent"
                size="icon"
                onClick={handleGenerate}
                disabled={isLoading || (!selectedImage && !userPrompt.trim())}
              >
                <Send />
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
