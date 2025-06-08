import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useColorPaletteStore } from "@/lib/store";
import Image from "next/image";

export function Header() {
  const { activeTab, setActiveTab } = useColorPaletteStore();

  return (
    <header className="flex justify-between p-6 border-b border-foreground/40">
      <div className="flex items-center gap-3">
        {/* <div className="w-10 h-10 bg-gradient-to-br from-[#FF2D55] to-[#FF9500] rounded-xl flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div> */}
        <div className="w-10 h-10 rounded-xl overflow-hidden">
          <Image src="/logo.jpg" alt="Logo" width={40} height={40} />
        </div>
        <h1 className="text-2xl font-black text-accent-foreground">
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
