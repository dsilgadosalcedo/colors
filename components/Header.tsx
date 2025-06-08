import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useColorPaletteStore } from "@/lib/store";
import Image from "next/image";

export function Header() {
  const { activeTab, setActiveTab } = useColorPaletteStore();

  return (
    <header className="flex justify-between p-6 border-b border-foreground/40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 p-0.5 bg-gradient-to-br from-[#338B8F] via-[#F07D21] to-[#FFDA33] rounded-lg overflow-hidden">
          <div className="bg-background w-full h-full grid place-items-center  rounded-md">
            <Image src="/camera.png" alt="Logo" width={24} height={24} />
          </div>
        </div>
        <h1 className="hidden md:block text-2xl font-black text-accent-foreground">
          Color Palette Generator
        </h1>
      </div>

      {/* Custom Navigation Buttons in Header */}
      <nav className="flex items-center">
        <Button
          onClick={() => setActiveTab("generator")}
          variant="link"
          className={cn(
            "text-xl font-extralight",
            activeTab !== "generator" && "opacity-50"
          )}
        >
          Generator
        </Button>
        <Button
          onClick={() => setActiveTab("collection")}
          variant="link"
          className={cn(
            "text-xl font-extralight",
            activeTab !== "collection" && "opacity-50"
          )}
        >
          My Collection
        </Button>
      </nav>
    </header>
  );
}
