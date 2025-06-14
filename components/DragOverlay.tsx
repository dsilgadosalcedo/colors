import React from "react";
import { cn } from "@/lib/utils";

interface DragOverlayProps {
  isVisible: boolean;
}

export function DragOverlay({ isVisible }: DragOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-200",
        "grid place-items-center place-content-center"
      )}
    >
      <img
        src="/logo.png"
        alt="Drop image"
        width={64}
        height={64}
        className="mb-4"
      />
      <h3 className="text-xl font-semibold text-background">Drop your image</h3>
    </div>
  );
}
