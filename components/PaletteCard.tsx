import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Palette, Trash2, Heart } from 'lucide-react'
import Image from 'next/image'
import { ColorInfo, ColorPalette } from '@/lib/types'
import { useRef } from 'react'

interface PaletteCardProps {
  palette: ColorPalette
  index: number
  onLoadPalette: (palette: ColorPalette) => void
  onDeletePalette: (index: number) => void
  onToggleFavorite: (index: number) => void
  isColorInPalette: (colors: ColorInfo[], hexToCheck: string) => boolean
}

export function PaletteCard({
  palette,
  index,
  onLoadPalette,
  onDeletePalette,
  onToggleFavorite,
  isColorInPalette,
}: PaletteCardProps) {
  const heartRef = useRef<HTMLButtonElement>(null)

  const handleFavoriteClick = async () => {
    if (!heartRef.current) {
      return
    }

    try {
      // Dynamically import GSAP for client-side animation
      const { gsap } = await import('gsap')

      // Get the SVG element inside the button
      const heartSvg = heartRef.current.querySelector('svg')

      if (palette.isFavorite) {
        // Unfavoriting animation - heartbeat with color fade
        const tl = gsap.timeline({
          onComplete: () => {
            onToggleFavorite(index)
          },
        })

        // Heartbeat: contract then expand
        tl.to(heartRef.current, {
          scale: 0.7,
          duration: 0.08,
          ease: 'power2.out',
        })
          // Fade out the red color during the first contraction
          .to(
            heartSvg,
            {
              fill: 'none',
              duration: 0.12,
            },
            0
          ) // Start at the same time as scale
          .to(heartRef.current, {
            scale: 1.15,
            duration: 0.12,
            ease: 'back.out(2)',
          })
          .to(heartRef.current, {
            scale: 1,
            duration: 0.1,
            ease: 'power2.out',
          })
      } else {
        // Create Twitter-style explosion effect
        createExplosionEffect(heartRef.current, gsap)

        // Heartbeat animation with smooth red fill
        const tl = gsap.timeline({
          onComplete: () => {
            onToggleFavorite(index)
          },
        })

        // Heartbeat: contract then expand with red fill
        tl.to(heartRef.current, {
          scale: 0.7,
          duration: 0.08,
          ease: 'power2.out',
        })
          // Start filling with red during the contraction
          .to(
            heartSvg,
            {
              fill: '#FF0000',
              duration: 0.1,
              ease: 'power2.out',
            },
            0
          ) // Start at the same time as scale animation
          .to(heartRef.current, {
            scale: 1.2,
            duration: 0.15,
            ease: 'back.out(3)',
          })
          .to(heartRef.current, {
            scale: 1,
            duration: 0.12,
            ease: 'power2.out',
          })
      }
    } catch (error) {
      // Fallback if GSAP fails to load
      onToggleFavorite(index)
    }
  }

  const createExplosionEffect = (heartElement: HTMLElement, gsap: any) => {
    const rect = heartElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Create bubble effect (like Twitter's ring) - smaller and more proportional
    const bubble = document.createElement('div')
    bubble.style.position = 'fixed'
    bubble.style.left = centerX - 15 + 'px'
    bubble.style.top = centerY - 15 + 'px'
    bubble.style.width = '30px'
    bubble.style.height = '30px'
    bubble.style.borderRadius = '50%'
    bubble.style.background =
      'radial-gradient(circle, rgba(226, 38, 77, 0.6) 0%, rgba(204, 142, 245, 0.4) 100%)'
    bubble.style.pointerEvents = 'none'
    bubble.style.zIndex = '1000'
    document.body.appendChild(bubble)

    // Animate bubble - smaller scale for proportional effect
    gsap.fromTo(
      bubble,
      { scale: 0, opacity: 1 },
      {
        scale: 1.8,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => bubble.remove(),
      }
    )

    // Create particle explosion - fewer and smaller particles
    const particleCount = 6
    const colors = [
      '#ff6b6b',
      '#feca57',
      '#ff9ff3',
      '#54a0ff',
      '#5f27cd',
      '#00d2d3',
    ]

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.style.position = 'fixed'
      particle.style.left = centerX - 2 + 'px'
      particle.style.top = centerY - 2 + 'px'
      particle.style.width = '4px'
      particle.style.height = '4px'
      particle.style.borderRadius = '50%'
      particle.style.background = colors[i]
      particle.style.pointerEvents = 'none'
      particle.style.zIndex = '1001'
      document.body.appendChild(particle)

      // Calculate explosion direction - shorter distance for smaller effect
      const angle = (i / particleCount) * Math.PI * 2
      const distance = 20 + Math.random() * 10 // 20-30px range (much smaller)
      const endX = centerX + Math.cos(angle) * distance
      const endY = centerY + Math.sin(angle) * distance

      // Animate particles with slightly faster timing
      const delay = Math.random() * 0.05
      const duration = 0.4 + Math.random() * 0.2

      gsap.to(particle, {
        x: endX - centerX,
        y: endY - centerY,
        scale: 0,
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: 'power2.out',
        onComplete: () => particle.remove(),
      })
    }
  }

  return (
    <Card key={index}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Image preview */}
          {palette.imagePreview && (
            <div className="w-20 h-22 rounded-sm overflow-hidden flex-shrink-0 relative">
              <img
                src={palette.imagePreview || '/placeholder.svg'}
                alt="Palette source"
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  {new Date(
                    palette.timestamp || Date.now()
                  ).toLocaleDateString()}
                </h4>
                <p className="text-xs text-card-foreground line-clamp-2">
                  {palette.mood}
                </p>
                {/* <p className="text-xs text-gray-400 mt-1">
                  {palette.colors.length} colors
                </p> */}
              </div>
              <button
                ref={heartRef}
                onClick={handleFavoriteClick}
                className="ml-2 bg-transparent hover:bg-transparent text-gray-400 border-gray-300 cursor-pointer transition-all duration-200 hover:scale-110"
              >
                <Heart
                  size={20}
                  fill={palette.isFavorite ? 'currentColor' : 'none'}
                  className={`${
                    palette.isFavorite
                      ? 'text-red-500 border-red-500'
                      : ' text-secondary border-secondary'
                  } transition-colors duration-200`}
                />
              </button>
            </div>

            {/* Color swatches - clickable to load palette */}
            <div className="flex items-end justify-between gap-2">
              <div
                className="flex w-min gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onLoadPalette(palette)}
                title="Click to load this palette"
              >
                {/* Show palette colors with dominant color first */}
                {palette.colors
                  .slice() // Create a copy to avoid mutating the original array
                  .sort((a, b) => {
                    const aIsDominant =
                      a.hex.toLowerCase() ===
                      palette.dominantColor.toLowerCase()
                    const bIsDominant =
                      b.hex.toLowerCase() ===
                      palette.dominantColor.toLowerCase()

                    if (aIsDominant && !bIsDominant) {
                      return -1
                    } // a comes first
                    if (!aIsDominant && bIsDominant) {
                      return 1
                    } // b comes first
                    return 0 // maintain original order for non-dominant colors
                  })
                  .slice(0, 5)
                  .map((color, i) => (
                    <div
                      key={`${color.hex}-${i}`}
                      className="w-6 h-6 rounded-full ring-1 ring-inset ring-border"
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
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="bg-transparent hover:bg-red-600/50 text-red-300 hover:text-red-300 border-red-700 hover:border-red-700 h-9 w-9"
                      title="Delete palette"
                    >
                      <Trash2 />
                      <span className="sr-only">Delete palette</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Palette</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this color palette? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeletePalette(index)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadPalette(palette)}
                  title="Load palette in generator"
                >
                  Open
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
