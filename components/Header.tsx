import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useColorPaletteStore } from '@/lib/store'
import { Palette } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Header() {
  const { activeTab, setActiveTab } = useColorPaletteStore()

  return (
    <header className="flex justify-between h-22 pl-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary grid place-items-center rounded-md">
          <Palette className="w-5 h-5 text-secondary-foreground" />
        </div>
        <h1 className="hidden md:block text-2xl font-black">
          Create Color Palettes
        </h1>
      </div>

      {/* Custom Navigation Buttons in Header */}
      <nav className="flex items-center gap-4">
        <Button
          onClick={() => setActiveTab('generator')}
          variant="link"
          className={cn(
            'text-xl font-semibold',
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
            'text-xl font-semibold',
            activeTab === 'collection'
              ? 'text-card-foreground'
              : 'text-muted-foreground'
          )}
        >
          My Collection
        </Button>
        <ThemeToggle />
      </nav>
    </header>
  )
}
