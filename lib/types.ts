export interface ColorInfo {
  hex: string;
  name: string;
  description: string;
}

export interface ColorPalette {
  colors: ColorInfo[];
  dominantColor: string;
  mood: string;
  timestamp?: number;
  imagePreview?: string;
}
