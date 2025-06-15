import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageBackgroundProps {
  selectedImage: string | null
  isLoading: boolean
  onRemoveImage: () => void
}

export function ImageBackground({
  selectedImage,
  isLoading,
  onRemoveImage,
}: ImageBackgroundProps) {
  return (
    <>
      {/* Background Image */}
      <div
        className={cn(
          'w-full h-[calc(100%+24px)] md:h-full md:mx-6 md:rounded-3xl absolute top-0 left-0 object-cover -z-10 duration-200 overflow-hidden',
          selectedImage
            ? 'opacity-40 blur-sm'
            : 'bg-gradient-to-b lg:bg-gradient-to-r from-secondary via-muted-foreground to-transparent opacity-20'
        )}
      >
        <Image
          src={selectedImage || '/placeholder.svg'}
          alt="Uploaded image"
          fill
          className="object-cover mask-b-from-30% lg:mask-b-from-100% lg:mask-r-from-30% data-[state=show]:animate-in data-[state=hide]:animate-out fade-in fade-out duration-300 data-[state=show]:blur-none data-[state=hide]:blur-lg data-[state=hide]:opacity-0"
          data-state={selectedImage ? 'show' : 'hide'}
        />
      </div>

      {/* Image Preview and Remove Button */}
      {selectedImage && (
        <div
          className="flex gap-2 group absolute top-4 left-4 md:left-10 data-[state=show]:animate-in data-[state=hide]:animate-out fade-in fade-out duration-200 data-[state=show]:blur-none data-[state=hide]:blur-lg data-[state=hide]:opacity-0"
          data-state={selectedImage ? 'show' : 'hide'}
        >
          <Image
            src={selectedImage}
            alt="Uploaded image"
            width={100}
            height={100}
            className="object-cover rounded-lg shadow-md hidden md:block"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveImage}
            disabled={isLoading}
          >
            <span className="hidden md:block">Remove</span>
            <span className="block md:hidden">Remove image</span>
          </Button>
        </div>
      )}
    </>
  )
}
