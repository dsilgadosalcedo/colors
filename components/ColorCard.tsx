import { Copy, Check } from "lucide-react";
import { ColorInfo } from "@/lib/types";
import { Badge } from "./ui/badge";

interface ColorCardProps {
  color: ColorInfo;
  copiedColor: string | null;
  onCopyColor: (hex: string) => void;
}

export function ColorCard({ color, copiedColor, onCopyColor }: ColorCardProps) {
  return (
    <div
      className="group cursor-pointer rounded-3xl relative"
      onClick={() => onCopyColor(color.hex)}
      style={{
        border: `2px solid ${color.hex}`,
      }}
    >
      <div
        className="w-[calc(100%-4px)] h-20 -translate-y-1 group-hover:translate-y-0 grid place-items-center rounded-3xl transition-all duration-300 group-hover:rounded-b-4xl group-hover:rounded-t-[20px] m-0.5"
        style={{ backgroundColor: color.hex }}
      >
        {copiedColor === color.hex ? (
          <Check className="w-6 h-6 text-white opacity-40 group-hover:opacity-100 group-hover:scale-105 animate-in fade-in-0 duration-200" />
        ) : (
          <Copy className="w-5 h-5 text-white opacity-40 group-hover:opacity-100 group-hover:scale-105 animate-in fade-in-0 duration-200" />
        )}
      </div>
      <Badge className="text-xs absolute top-2 right-2">{color.name}</Badge>
      <div className="m-2 text-center">
        <p className="text-xs text-gray-600 font-mono mt-0.5">{color.hex}</p>
        <p className="text-xs text-gray-500 mt-1 leading-tight line-clamp-2">
          {color.description}
        </p>
      </div>
    </div>
  );
}
