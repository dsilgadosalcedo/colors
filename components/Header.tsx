import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useColorPaletteStore } from "@/lib/store"
import Image from "next/image"
import { Palette } from "lucide-react"

export function Header() {
  const { activeTab, setActiveTab } = useColorPaletteStore()

  return (
    <header className="flex justify-between p-6">
      <div className="flex items-center gap-3">
        {/* <div className="w-10 h-10 p-0.5 bg-gradient-to-br from-[#338B8F] via-[#F07D21] to-[#FFDA33] rounded-lg overflow-hidden"> */}
        <div className="w-10 h-10 bg-[#50b1d8] grid place-items-center rounded-md">
          <Palette className="w-6 h-6 text-[#133541]" />
          {/* <Image src="/camera.png" alt="Logo" width={24} height={24} /> */}
        </div>
        {/* </div> */}
        <h1 className="hidden md:block text-2xl font-black text-[#77d9ab]">
          Create Color Palettes
        </h1>
      </div>

      {/* Custom Navigation Buttons in Header */}
      <nav className="flex items-center">
        <Button
          onClick={() => setActiveTab("generator")}
          variant="link"
          className={cn(
            "text-xl font-semibold",
            activeTab === "generator" ? "text-[#77d9ab]" : "text-[#189258]"
          )}
        >
          Generator
        </Button>
        <Button
          onClick={() => setActiveTab("collection")}
          variant="link"
          className={cn(
            "text-xl font-semibold",
            activeTab === "collection" ? "text-[#77d9ab]" : "text-[#189258]"
          )}
        >
          My Collection
        </Button>
      </nav>
    </header>
  )
}
