# Color Palette Generator - API Documentation

A comprehensive guide to all public APIs, functions, and components in the Color Palette Generator application.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [API Endpoints](#api-endpoints)
- [Server Actions](#server-actions)
- [Components](#components)
- [Custom Hooks](#custom-hooks)
- [State Management](#state-management)
- [Utility Libraries](#utility-libraries)
- [Types & Interfaces](#types--interfaces)
- [Validation Schemas](#validation-schemas)
- [Usage Examples](#usage-examples)

## 🏗️ Architecture Overview

The Color Palette Generator is built using:
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS v4
- **State Management**: Zustand with persistence middleware
- **AI Integration**: Google Gemini AI via Vercel AI SDK
- **UI Components**: Radix UI primitives with custom styling
- **Validation**: Zod schemas for type-safe validation

---

## 🔗 API Endpoints

### POST `/api/generate`

Generate color palettes using AI analysis of images or text prompts.

#### Request Body
```typescript
{
  imageDataUrl?: string;           // Base64 encoded image data URL
  defaultColorCount?: number;      // Number of colors (1-10, default: 3)
  userPrompt?: string;            // Text description for palette generation
  currentPalette?: ColorPalette;  // Existing palette for editing
}
```

#### Response
```typescript
{
  success: true;
  data: {
    colors: ColorInfo[];
    dominantColor: string;
    mood: string;
  };
  timestamp: string;
}
```

#### Error Responses
- `400` - Invalid request data
- `429` - Rate limit exceeded
- `500` - AI service error or internal error

#### Example Usage
```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageDataUrl: 'data:image/jpeg;base64,/9j/4AAQ...',
    defaultColorCount: 5,
    userPrompt: 'sunset ocean colors'
  })
});

const result = await response.json();
```

### GET `/api/generate`

Health check endpoint for the generation service.

#### Response
```typescript
{
  status: "healthy";
  timestamp: string;
  service: "color-palette-generator";
  version: string;
}
```

### POST `/api/analytics`

Submit web vitals and performance metrics.

#### Request Body
```typescript
{
  name: string;       // Metric name (CLS, FID, FCP, LCP, TTFB)
  value: number;      // Metric value
  id: string;         // Unique metric ID
  rating: string;     // Performance rating
  delta: number;      // Change from previous value
}
```

#### Response
```typescript
{
  success: true;
  message: "Metric recorded successfully";
}
```

---

## ⚡ Server Actions

### `generateColorPalette()`

Core server action for AI-powered color palette generation.

```typescript
async function generateColorPalette(
  imageDataUrl: string | null,
  defaultColorCount: number = 3,
  userPrompt?: string,
  currentPalette?: ColorPalette
): Promise<ColorPalette>
```

#### Parameters
- `imageDataUrl`: Base64 image data or null for text-only generation
- `defaultColorCount`: Number of colors to generate (1-10)
- `userPrompt`: Optional text description or editing instructions
- `currentPalette`: Optional existing palette for editing mode

#### Returns
- `ColorPalette` object with colors, dominant color, and mood

#### Usage Modes

1. **Image-based Generation**
```typescript
const palette = await generateColorPalette(
  'data:image/jpeg;base64,...',
  5,
  'warm sunset colors'
);
```

2. **Text-only Generation**
```typescript
const palette = await generateColorPalette(
  null,
  4,
  'forest green and earth tones'
);
```

3. **Palette Editing**
```typescript
const updatedPalette = await generateColorPalette(
  null,
  currentPalette.colors.length,
  'add a bright red color',
  currentPalette
);
```

#### Features
- Advanced color theory analysis
- WCAG accessibility compliance
- Professional color naming
- Context-aware color selection
- Intelligent palette editing

---

## 🧩 Components

### Core Components

#### `ImageUpload`

Main interface for image upload and palette generation.

```typescript
interface ImageUploadProps {
  onGeneratePalette: (userPrompt?: string) => void;
}
```

**Features:**
- Drag & drop image upload
- Camera capture on mobile devices
- Text prompt input with examples
- Real-time loading states
- Editing mode support

**Usage:**
```tsx
<ImageUpload onGeneratePalette={handleGenerate} />
```

#### `ColorPaletteDisplay`

Displays generated color palettes with interactive features.

```typescript
interface ColorPaletteDisplayProps {
  state: 'show' | 'hide';
}
```

**Features:**
- Color card grid display
- Dominant color highlighting
- Undo/redo functionality
- Save, download, and share actions
- Mood description display

**Usage:**
```tsx
<ColorPaletteDisplay state="show" />
```

#### `ColorCard`

Individual color display component with interactive features.

```typescript
interface ColorCardProps {
  color: ColorInfo;
  copiedColor: string | null;
  onCopyColor: (hex: string) => void;
  isPrimary?: boolean;
}
```

**Features:**
- Hex code display and copying
- Color preview with accessibility checks
- Interactive hover states
- Primary color indication

### UI Components

#### Button Components

```typescript
// Basic button with variants
<Button variant="default" | "outline" | "ghost" size="sm" | "md" | "lg">
  Click me
</Button>

// Icon button
<Button variant="outline" size="sm">
  <Download size={16} />
  Download
</Button>
```

#### Form Components

```typescript
// Input field
<Input 
  type="text" 
  placeholder="Enter text..." 
  value={value}
  onChange={handleChange}
/>

// Textarea
<Textarea
  placeholder="Describe your palette..."
  value={prompt}
  onChange={setPrompt}
/>

// Label
<Label htmlFor="input-id">Field Label</Label>
```

#### Layout Components

```typescript
// Card container
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>

// Alert messages
<Alert>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert description</AlertDescription>
</Alert>
```

#### Navigation Components

```typescript
// Sidebar navigation
<Sidebar>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Group Title</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>

// Breadcrumb navigation
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

## 🪝 Custom Hooks

### `useIsMobile()`

Detects mobile viewport breakpoints.

```typescript
function useIsMobile(): boolean
```

**Features:**
- Responsive breakpoint detection (768px)
- SSR-safe implementation
- Real-time viewport updates

**Usage:**
```tsx
const isMobile = useIsMobile();

return (
  <div>
    {isMobile ? <MobileComponent /> : <DesktopComponent />}
  </div>
);
```

### `useToast()`

Toast notification system hook.

```typescript
function useToast(): {
  toast: (props: ToastProps) => void;
  dismiss: (toastId?: string) => void;
  toasts: Toast[];
}

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}
```

**Usage:**
```tsx
const { toast } = useToast();

const handleSuccess = () => {
  toast({
    title: "Success",
    description: "Palette saved successfully!",
    variant: "default"
  });
};

const handleError = () => {
  toast({
    title: "Error",
    description: "Failed to save palette",
    variant: "destructive"
  });
};
```

---

## 📦 State Management

### Zustand Store - `useColorPaletteStore`

Global state management for the application.

#### State Interface

```typescript
interface ColorPaletteState {
  // UI State
  selectedImage: string | null;
  colorPalette: ColorPalette | null;
  isLoading: boolean;
  dragActive: boolean;
  pageDragActive: boolean;
  copiedColor: string | null;
  colorCount: number;
  activeTab: string;
  isCurrentPaletteSaved: boolean;
  downloadBounce: boolean;
  isEditingMode: boolean;
  editingPaletteIndex: number | null;

  // Color text preview state
  colorTextPreview: string;
  isColorTextPreviewMode: boolean;

  // Undo/Redo State
  previousPalette: ColorPalette | null;
  previousPaletteWasSaved: boolean;
  hasUndone: boolean;
  canUndo: boolean;
  canRedo: boolean;

  // Persisted State
  savedPalettes: ColorPalette[];
}
```

#### Key Actions

```typescript
// Image management
setSelectedImage: (image: string | null) => void;
handleImageUpload: (file: File) => void;
loadDefaultImage: () => Promise<void>;

// Palette management
setColorPalette: (palette: ColorPalette | null) => void;
savePalette: () => Promise<void>;
deleteSavedPalette: (index: number) => void;
loadSavedPalette: (palette: ColorPalette) => void;

// Editing features
setIsEditingMode: (editing: boolean) => void;
exitEditingMode: () => void;
undoPalette: () => void;
redoPalette: () => void;

// Utility actions
copyToClipboard: (hex: string) => void;
downloadPalette: () => void;
sharePalette: () => Promise<void>;
toggleFavorite: (index: number) => void;
```

#### Usage Examples

```tsx
// Basic usage
const {
  colorPalette,
  isLoading,
  savedPalettes,
  setColorPalette,
  savePalette
} = useColorPaletteStore();

// Save current palette
const handleSave = async () => {
  await savePalette();
};

// Load a saved palette
const handleLoad = (palette: ColorPalette) => {
  loadSavedPalette(palette);
};

// Copy color to clipboard
const handleCopyColor = (hex: string) => {
  copyToClipboard(hex);
};
```

---

## 🛠️ Utility Libraries

### `cn()` - Class Name Utility

Combines and merges Tailwind CSS classes intelligently.

```typescript
function cn(...inputs: ClassValue[]): string
```

**Usage:**
```tsx
// Conditional classes
<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-class"
)} />

// Merging classes with conflicts
<div className={cn(
  "p-4 text-blue-500",  // This blue will be overridden
  "text-red-500"        // Final color will be red
)} />
```

### Performance Monitoring

#### `PerformanceMonitor`

Component for tracking Core Web Vitals.

```typescript
<PerformanceMonitor />
```

**Features:**
- Automatic Web Vitals collection
- Real-time performance metrics
- PostHog integration
- Development mode logging

### Analytics Integration

#### PostHog Provider

```typescript
<PostHogProvider>
  <App />
</PostHogProvider>
```

**Features:**
- User behavior tracking
- Feature flag management
- A/B testing support
- Performance analytics

---

## 📊 Types & Interfaces

### Core Data Types

```typescript
// Color information structure
interface ColorInfo {
  hex: string;          // Hex color code (e.g., "#FF5733")
  name: string;         // Creative color name
  description: string;  // Brief color description
}

// Complete color palette
interface ColorPalette {
  colors: ColorInfo[];        // Array of colors in palette
  dominantColor: string;      // Primary/dominant hex color
  mood: string;              // Overall palette mood description
  timestamp?: number;        // Creation timestamp
  imagePreview?: string;     // Base64 image preview
  isFavorite?: boolean;      // Favorite status
}
```

### Component Props Types

```typescript
// Image upload component props
interface ImageUploadProps {
  onGeneratePalette: (userPrompt?: string) => void;
}

// Color card component props
interface ColorCardProps {
  color: ColorInfo;
  copiedColor: string | null;
  onCopyColor: (hex: string) => void;
  isPrimary?: boolean;
}

// Color palette display props
interface ColorPaletteDisplayProps {
  state: 'show' | 'hide';
}
```

### API Types

```typescript
// Generate palette request
interface GeneratePaletteRequest {
  imageDataUrl?: string;
  defaultColorCount?: number;
  userPrompt?: string;
  currentPalette?: ColorPalette;
}

// API response format
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryAfter?: number;
  };
  timestamp: string;
}
```

---

## ✅ Validation Schemas

### Zod Validation Schemas

#### Color Validation

```typescript
// Hex color validation
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');

// Color object validation
const colorSchema = z.object({
  hex: hexColorSchema,
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200)
});

// Color palette validation
const paletteSchema = z.object({
  colors: z.array(colorSchema).min(1).max(10),
  dominantColor: hexColorSchema,
  mood: z.string().min(1).max(100)
});
```

#### Image Validation

```typescript
// Image data URL validation
const imageDataUrlSchema = z
  .string()
  .refine(data => /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(data))
  .refine(data => {
    const base64Data = data.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    return sizeInBytes <= 10 * 1024 * 1024; // 10MB limit
  });

// File upload validation
const fileUploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024),
  type: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
});
```

#### API Request Validation

```typescript
// Generate palette request validation
const generatePaletteRequestSchema = z.object({
  imageDataUrl: imageDataUrlSchema.optional(),
  defaultColorCount: z.number().int().min(1).max(10).default(3),
  userPrompt: z.string().min(1).max(500).optional(),
  currentPalette: paletteSchema.optional()
});
```

### Validation Helper Functions

```typescript
// Generic validation function
function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] }

// Environment validation
function validateEnv(): EnvConfig

// Validation middleware creator
function createValidationMiddleware<T>(
  schema: z.ZodSchema<T>
): (data: unknown) => T
```

---

## 💡 Usage Examples

### Complete Palette Generation Flow

```tsx
import { useColorPaletteStore } from '@/lib/store';
import { generateColorPalette } from '@/app/actions';

function PaletteGenerator() {
  const { 
    setColorPalette, 
    setIsLoading, 
    selectedImage 
  } = useColorPaletteStore();

  const handleGenerate = async (userPrompt?: string) => {
    try {
      setIsLoading(true);
      
      const palette = await generateColorPalette(
        selectedImage,
        5,
        userPrompt
      );
      
      setColorPalette(palette);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ImageUpload onGeneratePalette={handleGenerate} />
      <ColorPaletteDisplay state="show" />
    </div>
  );
}
```

### Image Upload with Validation

```tsx
import { fileUploadSchema } from '@/lib/validations';

function ImageUploader() {
  const { handleImageUpload } = useColorPaletteStore();

  const onFileSelect = (file: File) => {
    // Validate file
    const validation = fileUploadSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (!validation.success) {
      toast({
        title: "Invalid file",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    // Process valid file
    handleImageUpload(file);
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
      }}
    />
  );
}
```

### API Integration

```tsx
// Client-side API call
async function generatePaletteAPI(request: GeneratePaletteRequest) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Usage with error handling
const handleAPIGeneration = async () => {
  try {
    const result = await generatePaletteAPI({
      imageDataUrl: selectedImage,
      defaultColorCount: 5,
      userPrompt: "ocean sunset colors"
    });
    
    setColorPalette(result.data);
  } catch (error) {
    if (error.message.includes('429')) {
      toast({
        title: "Rate limited",
        description: "Please wait before generating another palette"
      });
    } else {
      toast({
        title: "Generation failed",
        description: "Please try again"
      });
    }
  }
};
```

### Custom Hook Implementation

```tsx
// Custom hook for palette management
function usePaletteManager() {
  const store = useColorPaletteStore();
  
  const generateFromImage = async (file: File, prompt?: string) => {
    store.setIsLoading(true);
    try {
      store.handleImageUpload(file);
      const palette = await generateColorPalette(
        // Wait for image to be processed
        null, // Will be set by handleImageUpload
        5,
        prompt
      );
      store.setColorPalette(palette);
      return palette;
    } finally {
      store.setIsLoading(false);
    }
  };

  const saveCurrentPalette = async () => {
    if (store.colorPalette && !store.isCurrentPaletteSaved) {
      await store.savePalette();
      toast({
        title: "Saved!",
        description: "Palette added to your collection"
      });
    }
  };

  return {
    ...store,
    generateFromImage,
    saveCurrentPalette
  };
}
```

---

## 🔐 Security & Rate Limiting

### Rate Limiting

The API includes intelligent rate limiting:

```typescript
// Rate limiter configuration
const aiServiceLimiter = new RateLimiter({
  requests: 10,        // Max requests
  window: 60000,       // Per minute
  keyGenerator: (req) => req.ip || 'anonymous'
});
```

### Input Sanitization

All user inputs are validated and sanitized:

```typescript
// HTML sanitization
const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// String sanitization
const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .substring(0, 1000); // Limit length
};
```

---

## 📈 Error Handling

### API Error Types

```typescript
// Standardized API errors
const API_ERRORS = {
  VALIDATION_ERROR: (message: string) => ({
    code: 'VALIDATION_ERROR',
    message,
    status: 400
  }),
  RATE_LIMIT_EXCEEDED: (retryAfter: number) => ({
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests',
    status: 429,
    retryAfter
  }),
  AI_SERVICE_ERROR: (message: string) => ({
    code: 'AI_SERVICE_ERROR',
    message,
    status: 502
  }),
  INTERNAL_ERROR: (message: string) => ({
    code: 'INTERNAL_ERROR',
    message,
    status: 500
  })
};
```

### Error Boundary Component

```tsx
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error, errorInfo) => {
    console.error('Error boundary caught:', error, errorInfo);
  }}
>
  <App />
</ErrorBoundary>
```

---

This documentation covers all public APIs, functions, and components in the Color Palette Generator application. For implementation details or additional examples, refer to the source code or create GitHub issues for specific questions.