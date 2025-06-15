import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useColorPaletteStore } from '@/lib/store'
import {
  NO_IMAGE_EXAMPLES,
  WITH_IMAGE_EXAMPLES,
  EDITING_EXAMPLES,
} from './constants'

interface ExamplePromptProps {
  userPrompt: string
  isLoading: boolean
  onExampleClick: () => void
}

export function ExamplePrompt({
  userPrompt,
  isLoading,
  onExampleClick,
}: ExamplePromptProps) {
  const exampleTextRef = useRef<HTMLSpanElement>(null)
  const [currentExample, setCurrentExample] = useState('')
  const [isAnimatingExample, setIsAnimatingExample] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { selectedImage, isEditingMode } = useColorPaletteStore()

  const getInitialExample = (): string => {
    if (isEditingMode) {
      return EDITING_EXAMPLES[
        Math.floor(Math.random() * EDITING_EXAMPLES.length)
      ]
    }

    if (selectedImage) {
      return WITH_IMAGE_EXAMPLES[
        Math.floor(Math.random() * WITH_IMAGE_EXAMPLES.length)
      ]
    }

    return NO_IMAGE_EXAMPLES[
      Math.floor(Math.random() * NO_IMAGE_EXAMPLES.length)
    ]
  }

  const getRandomExample = (): string => {
    let examples: string[]

    if (isEditingMode) {
      examples = EDITING_EXAMPLES
    } else if (selectedImage) {
      examples = WITH_IMAGE_EXAMPLES
    } else {
      examples = NO_IMAGE_EXAMPLES
    }

    // Get a different example than the current one
    const otherExamples = examples.filter(example => example !== currentExample)
    return otherExamples[Math.floor(Math.random() * otherExamples.length)]
  }

  const animateToNewExample = async (newExample: string) => {
    if (
      !exampleTextRef.current ||
      isAnimatingExample ||
      newExample === currentExample
    ) {
      return
    }

    setIsAnimatingExample(true)
    simulateTypingTransition(currentExample, newExample)
  }

  const simulateTypingTransition = (oldText: string, newText: string) => {
    let currentText = oldText
    let phase: 'backspacing' | 'typing' = 'backspacing'
    let showCursor = true
    let cursorInterval: NodeJS.Timeout | null = null
    let nextStepTimeout: NodeJS.Timeout | null = null

    // Cleanup function to clear all timers
    const cleanup = () => {
      if (cursorInterval) {
        clearInterval(cursorInterval)
      }
      if (nextStepTimeout) {
        clearTimeout(nextStepTimeout)
      }
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup()
        setCurrentExample(newText)
        setIsAnimatingExample(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start cursor blinking
    cursorInterval = setInterval(() => {
      showCursor = !showCursor
      updateDisplay()
    }, 530)

    const updateDisplay = () => {
      if (exampleTextRef.current) {
        const displayText = currentText + (showCursor ? '|' : ' ')
        exampleTextRef.current.textContent = displayText
      }
    }

    const processNextStep = () => {
      if (phase === 'backspacing') {
        if (currentText.length > 0) {
          // Random backspace speed (40-120ms)
          const delay = Math.random() * 80 + 40
          currentText = currentText.slice(0, -1)
          updateDisplay()
          nextStepTimeout = setTimeout(processNextStep, delay)
        } else {
          // Switch to typing phase
          phase = 'typing'
          // Small pause before typing
          nextStepTimeout = setTimeout(processNextStep, 200)
        }
      } else {
        // Typing phase
        if (currentText.length < newText.length) {
          // Random typing speed (60-150ms)
          const delay = Math.random() * 90 + 60
          currentText = newText.slice(0, currentText.length + 1)
          updateDisplay()
          nextStepTimeout = setTimeout(processNextStep, delay)
        } else {
          // Animation complete
          cleanup()
          document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
          )
          setCurrentExample(newText)
          setIsAnimatingExample(false)
        }
      }
    }

    // Start the animation
    processNextStep()
  }

  const handleExampleClick = () => {
    if (!isLoading && !isAnimatingExample) {
      onExampleClick()
    }
  }

  // Initialize example on mount
  useEffect(() => {
    if (!isInitialized) {
      const initialExample = getInitialExample()
      setCurrentExample(initialExample)
      setIsInitialized(true)
    }
  }, [isInitialized, getInitialExample])

  // Update example when context changes
  useEffect(() => {
    if (isInitialized) {
      const newExample = getRandomExample()
      animateToNewExample(newExample)
    }
  }, [
    selectedImage,
    isEditingMode,
    isInitialized,
    getRandomExample,
    animateToNewExample,
  ])

  // Don't render if there's user input
  if (userPrompt.trim()) {
    return null
  }

  return (
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
  )
}
