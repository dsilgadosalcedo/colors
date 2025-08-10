import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useColorPaletteStore } from '@/lib/store'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  NO_IMAGE_EXAMPLES,
  WITH_IMAGE_EXAMPLES,
  EDITING_EXAMPLES,
} from './constants'

interface ExamplePromptProps {
  userPrompt: string
  isLoading: boolean
  onExampleClick: (example: string) => void
}

export const ExamplePrompt = React.memo(function ExamplePrompt({
  userPrompt,
  isLoading,
  onExampleClick,
}: ExamplePromptProps) {
  const exampleTextRef = useRef<HTMLSpanElement>(null)
  const [currentExample, setCurrentExample] = useState('')
  const [isAnimatingExample, setIsAnimatingExample] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const selectedImage = useColorPaletteStore(state => state.selectedImage)
  const isEditingMode = useColorPaletteStore(state => state.isEditingMode)

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
          // Random backspace speed (20-60ms) - faster
          const delay = Math.random() * 40 + 20
          currentText = currentText.slice(0, -1)
          updateDisplay()
          nextStepTimeout = setTimeout(processNextStep, delay)
        } else {
          // Switch to typing phase
          phase = 'typing'
          // Small pause before typing
          nextStepTimeout = setTimeout(processNextStep, 100)
        }
      } else {
        // Typing phase
        if (currentText.length < newText.length) {
          // Random typing speed (30-80ms) - faster
          const delay = Math.random() * 50 + 30
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
      onExampleClick(currentExample)
    }
  }

  // Initialize example on mount with typing animation
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      const initialExample = getInitialExample()
      animateToNewExample(initialExample)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized])

  // Schedule next example rotation with a pause to allow clicks
  useEffect(() => {
    if (!isInitialized || isAnimatingExample || !currentExample) {
      return
    }
    const rotationDelay = 7000 // milliseconds to wait before next animation (reduced to 4s)
    const timeoutId = setTimeout(() => {
      const newExample = getRandomExample()
      animateToNewExample(newExample)
    }, rotationDelay)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedImage,
    isEditingMode,
    isInitialized,
    currentExample,
    isAnimatingExample,
  ])

  const isMobile = useIsMobile()

  // Don't render if there's user input
  if (userPrompt.trim()) {
    return null
  }

  return (
    <div className="mb-3 text-center max-w-[calc(100vw-32px)]">
      <Button
        variant="outline"
        size={isMobile ? 'sm' : 'default'}
        onClick={handleExampleClick}
        className="bg-transparent max-w-full text-sm transition-all cursor-pointer backdrop-blur-sm px-4 py-2 hover:scale-105 active:scale-95 duration-200 overflow-hidden whitespace-nowrap"
        disabled={isLoading || isAnimatingExample}
        aria-label="Example prompt"
      >
        <span ref={exampleTextRef} className="inline-block">
          {currentExample}
        </span>
      </Button>
    </div>
  )
})
