import { Copy, Check } from "lucide-react";
import { ColorInfo } from "@/lib/types";

interface ColorCardProps {
  color: ColorInfo;
  copiedColor: string | null;
  onCopyColor: (hex: string) => void;
}

export function ColorCard({ color, copiedColor, onCopyColor }: ColorCardProps) {
  return (
    <div
      className="group cursor-pointer"
      onClick={() => onCopyColor(color.hex)}
    >
      <div
        className="w-full h-20 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-102 relative"
        style={{ backgroundColor: color.hex }}
      >
        <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-200">
          {copiedColor === color.hex ? (
            <Check className="w-6 h-6 text-white opacity-20 group-hover:opacity-100" />
          ) : (
            <Copy className="w-5 h-5 text-white opacity-20 group-hover:opacity-100" />
          )}
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="font-medium text-gray-900 text-sm">{color.name}</p>
        <p className="text-xs text-gray-600 font-mono mt-0.5">{color.hex}</p>
        <p className="text-xs text-gray-500 mt-1 leading-tight line-clamp-2">
          {color.description}
        </p>
      </div>
    </div>
  );
}
