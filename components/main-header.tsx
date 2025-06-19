import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useColorPaletteStore } from '@/lib/store'
import { Palette } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function MainHeader() {
  const { activeTab, setActiveTab } = useColorPaletteStore()

  return (
    <header className="flex justify-between h-16 md:h-22 px-4 md:px-6">
      <div className="hidden md:flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary grid place-items-center rounded-md">
          <Palette className="w-5 h-5 text-secondary-foreground" />
        </div>
        <h1 className="hidden md:block text-2xl font-black">
          Create Color Palettes
        </h1>
      </div>

      {/* Custom Navigation Buttons in Header */}
      <nav className="flex w-full md:w-auto items-center gap-2 md:gap-4">
        <Button
          onClick={() => setActiveTab('generator')}
          variant="link"
          className={cn(
            'px-2 md:px-3 text-md md:text-xl font-semibold',
            activeTab === 'generator'
              ? 'text-card-foreground'
              : 'text-muted-foreground'
          )}
        >
          Generator
        </Button>
        <Button
          onClick={() => setActiveTab('collection')}
          variant="link"
          className={cn(
            'px-2 md:px-3 text-md md:text-xl font-semibold mr-1',
            activeTab === 'collection'
              ? 'text-card-foreground'
              : 'text-muted-foreground'
          )}
        >
          My Collection
        </Button>
        <div className="flex-1 flex justify-end">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
