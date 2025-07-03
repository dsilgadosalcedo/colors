# Components Guide

Complete documentation for all components in the Color Palette Generator application.

## 📋 Table of Contents

- [Core Application Components](#core-application-components)
- [UI Components Library](#ui-components-library)
- [Layout Components](#layout-components)
- [Form Components](#form-components)
- [Navigation Components](#navigation-components)
- [Component Best Practices](#component-best-practices)

---

## 🎨 Core Application Components

### `ImageUpload`

Main interface component for uploading images and generating color palettes.

#### Props
```typescript
interface ImageUploadProps {
  onGeneratePalette: (userPrompt?: string) => void;
}
```

#### Features
- **Drag & Drop Support**: Full drag and drop functionality for image uploads
- **Mobile Camera**: Camera capture support on mobile devices
- **Text Prompts**: AI-powered text-to-palette generation
- **Example Prompts**: Predefined example prompts for inspiration
- **Loading States**: Animated loading indicators with progress messages
- **Editing Mode**: Support for editing existing palettes

#### Usage Example
```tsx
import { ImageUpload } from '@/components/ImageUpload';

function App() {
  const handleGenerate = async (userPrompt?: string) => {
    // Generate palette logic
    await generateColorPalette(selectedImage, colorCount, userPrompt);
  };

  return <ImageUpload onGeneratePalette={handleGenerate} />;
}
```

#### Internal Components

**`ExamplePrompt`**
- Displays rotating example prompts
- Clickable prompts that populate the input
- Context-aware examples based on current state

**`ImageBackground`**
- Background image display with overlay effects
- Image removal functionality
- Loading state visualization

**`TextInputArea`**
- Main text input for prompts and descriptions
- Color count selector
- Action buttons (upload, camera, generate)
- Keyboard shortcuts (Enter to submit, Shift+Enter for new line)

---

### `ColorPaletteDisplay`

Component for displaying generated color palettes with interactive features.

#### Props
```typescript
interface ColorPaletteDisplayProps {
  state: 'show' | 'hide';
}
```

#### Features
- **Animated Transitions**: Smooth show/hide animations
- **Color Grid Layout**: Responsive grid display of colors
- **Dominant Color Priority**: Automatic sorting with dominant color first
- **Action Bar**: Save, download, and share functionality
- **Undo/Redo**: Full undo/redo support for palette editing
- **Mood Display**: Contextual mood description

#### Usage Example
```tsx
import { ColorPaletteDisplay } from '@/components/color-palette';

function PaletteViewer() {
  const { colorPalette } = useColorPaletteStore();
  
  return (
    <ColorPaletteDisplay 
      state={colorPalette ? 'show' : 'hide'} 
    />
  );
}
```

#### Action Buttons
- **Save Palette**: Saves to local storage with visual feedback
- **Download CSS**: Exports palette as CSS custom properties
- **Share**: Native Web Share API integration
- **Undo/Redo**: Smart undo/redo with state management

---

### `ColorCard`

Individual color display component with interaction capabilities.

#### Props
```typescript
interface ColorCardProps {
  color: ColorInfo;
  copiedColor: string | null;
  onCopyColor: (hex: string) => void;
  isPrimary?: boolean;
}
```

#### Features
- **Copy to Clipboard**: One-click hex code copying
- **Visual Feedback**: Copy confirmation animations
- **Accessibility**: Proper contrast ratios and ARIA labels
- **Primary Indicator**: Special styling for dominant colors
- **Interactive States**: Hover and focus states

#### Usage Example
```tsx
import { ColorCard } from '@/components/color-card';

function ColorGrid({ palette }: { palette: ColorPalette }) {
  const { copyToClipboard, copiedColor } = useColorPaletteStore();

  return (
    <div className="grid grid-cols-2 gap-4">
      {palette.colors.map((color, index) => (
        <ColorCard
          key={`${color.hex}-${index}`}
          color={color}
          copiedColor={copiedColor}
          onCopyColor={copyToClipboard}
          isPrimary={color.hex === palette.dominantColor}
        />
      ))}
    </div>
  );
}
```

---

### `SavedPalettes`

Component for managing and displaying saved color palettes.

#### Features
- **Palette Library**: Grid display of saved palettes
- **Quick Actions**: Load, delete, and favorite palettes
- **Search & Filter**: Find palettes by color or mood
- **Bulk Operations**: Select and manage multiple palettes
- **Export Options**: Export individual or multiple palettes

#### Usage Example
```tsx
import { SavedPalettes } from '@/components/saved-palettes';

function PaletteLibrary() {
  return (
    <div className="palette-library">
      <SavedPalettes />
    </div>
  );
}
```

---

### `PaletteCard`

Compact palette preview component for saved palettes list.

#### Features
- **Color Strip Preview**: Horizontal color strip display
- **Metadata Display**: Creation date, mood, and color count
- **Action Menu**: Context menu with load, delete, and share options
- **Favorite Toggle**: Heart icon for favoriting palettes
- **Responsive Design**: Adapts to different screen sizes

---

## 🧩 UI Components Library

### Button Components

#### `Button`

Versatile button component with multiple variants and sizes.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

**Usage Examples:**
```tsx
// Primary button
<Button variant="default" size="lg">
  Generate Palette
</Button>

// Outline button with icon
<Button variant="outline" size="sm">
  <Download className="mr-2 h-4 w-4" />
  Download
</Button>

// Icon-only button
<Button variant="ghost" size="icon">
  <Heart className="h-4 w-4" />
</Button>

// Link-style button
<Button variant="link" asChild>
  <Link href="/about">Learn More</Link>
</Button>
```

#### `ThemeToggle`

Theme switching component with system, light, and dark modes.

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

function Header() {
  return (
    <header className="flex justify-between items-center">
      <h1>Color Palette Generator</h1>
      <ThemeToggle />
    </header>
  );
}
```

---

### Form Components

#### `Input`

Styled input component with proper accessibility.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**Usage:**
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SearchForm() {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-2">
      <Label htmlFor="search">Search palettes</Label>
      <Input
        id="search"
        type="text"
        placeholder="Enter color name or mood..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
```

#### `Textarea`

Multi-line text input with auto-resize capabilities.

```tsx
import { Textarea } from '@/components/ui/textarea';

function PromptInput() {
  const [prompt, setPrompt] = useState('');

  return (
    <Textarea
      placeholder="Describe your desired color palette..."
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      className="min-h-[100px] resize-none"
    />
  );
}
```

#### `Select`

Dropdown select component with search functionality.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function ColorCountSelector() {
  return (
    <Select onValueChange={(value) => setColorCount(Number(value))}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Number of colors" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="3">3 colors</SelectItem>
        <SelectItem value="4">4 colors</SelectItem>
        <SelectItem value="5">5 colors</SelectItem>
        <SelectItem value="6">6 colors</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

#### `Checkbox` & `Switch`

Toggle components for settings and preferences.

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function SettingsForm() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="auto-save" />
        <Label htmlFor="auto-save">Auto-save palettes</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="dark-mode" />
        <Label htmlFor="dark-mode">Dark mode</Label>
      </div>
    </div>
  );
}
```

---

### Layout Components

#### `Card`

Container component for content sections.

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function PaletteInfo({ palette }: { palette: ColorPalette }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Palette Details</CardTitle>
        <CardDescription>
          Created {format(new Date(palette.timestamp), 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {palette.mood}
        </p>
      </CardContent>
      <CardFooter>
        <Button>Load Palette</Button>
      </CardFooter>
    </Card>
  );
}
```

#### `Alert`

Notification component for important messages.

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

function NotificationExamples() {
  return (
    <div className="space-y-4">
      {/* Success alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Your palette has been saved successfully.
        </AlertDescription>
      </Alert>

      {/* Warning alert */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to generate palette. Please try again.
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

#### `Separator`

Visual divider component.

```tsx
import { Separator } from '@/components/ui/separator';

function SectionDivider() {
  return (
    <div className="space-y-4">
      <div>Section 1 content</div>
      <Separator />
      <div>Section 2 content</div>
    </div>
  );
}
```

---

### Modal & Overlay Components

#### `Dialog`

Modal dialog component for important interactions.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function DeleteConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Palette</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Palette</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this palette? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### `Sheet`

Slide-out panel component for secondary content.

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

function SettingsPanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Application Settings</SheetTitle>
          <SheetDescription>
            Configure your palette generation preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {/* Settings content */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

#### `Popover`

Floating content component for contextual information.

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

function ColorInfo({ color }: { color: ColorInfo }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Info
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">{color.name}</h4>
          <p className="text-sm text-muted-foreground">
            {color.description}
          </p>
          <div className="text-xs font-mono">{color.hex}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

### Navigation Components

#### `Breadcrumb`

Navigation breadcrumb component.

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function Navigation() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/palettes">Palettes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Edit Palette</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

#### `Tabs`

Tab navigation component for organizing content.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function PaletteTabs() {
  return (
    <Tabs defaultValue="generator" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generator">Generator</TabsTrigger>
        <TabsTrigger value="saved">Saved Palettes</TabsTrigger>
      </TabsList>
      <TabsContent value="generator">
        <ImageUpload onGeneratePalette={handleGenerate} />
      </TabsContent>
      <TabsContent value="saved">
        <SavedPalettes />
      </TabsContent>
    </Tabs>
  );
}
```

---

## 🎯 Component Best Practices

### 1. **Component Composition**

Build components that can be easily composed together:

```tsx
// Good: Composable components
<Card>
  <CardHeader>
    <CardTitle>Palette Colors</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-2">
      {colors.map(color => (
        <ColorCard key={color.hex} color={color} />
      ))}
    </div>
  </CardContent>
</Card>

// Avoid: Monolithic components with too many responsibilities
```

### 2. **Proper Props Interface Design**

Design clear, type-safe props interfaces:

```tsx
// Good: Clear, specific props
interface ColorCardProps {
  color: ColorInfo;
  onCopyColor: (hex: string) => void;
  isPrimary?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Avoid: Vague or overly permissive props
interface BadProps {
  data: any;
  onClick: () => void;
  style?: any;
}
```

### 3. **Accessibility First**

Always include proper accessibility attributes:

```tsx
function ColorCard({ color, onCopyColor }: ColorCardProps) {
  return (
    <button
      onClick={() => onCopyColor(color.hex)}
      aria-label={`Copy ${color.name} color ${color.hex}`}
      className="color-card"
    >
      <div 
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
        className="color-preview"
      />
      <span className="sr-only">
        {color.name}: {color.hex}
      </span>
    </button>
  );
}
```

### 4. **Performance Optimization**

Use React optimization techniques appropriately:

```tsx
// Memoize expensive components
const ColorCard = memo(({ color, onCopyColor }: ColorCardProps) => {
  return (
    <div className="color-card">
      {/* Component content */}
    </div>
  );
});

// Use callback optimization for event handlers
const MemoizedColorGrid = memo(({ colors }: { colors: ColorInfo[] }) => {
  const handleCopyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
  }, []);

  return (
    <div className="grid">
      {colors.map(color => (
        <ColorCard 
          key={color.hex} 
          color={color} 
          onCopyColor={handleCopyColor} 
        />
      ))}
    </div>
  );
});
```

### 5. **Error Boundaries**

Wrap components with error boundaries for graceful failure handling:

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ImageUpload onGeneratePalette={handleGenerate} />
      <ColorPaletteDisplay state="show" />
    </ErrorBoundary>
  );
}
```

### 6. **Consistent Styling Patterns**

Use consistent class naming and styling patterns:

```tsx
// Good: Consistent, descriptive class names
<div className="palette-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <div className="color-card rounded-lg border p-4 hover:shadow-md transition-shadow">
    {/* Card content */}
  </div>
</div>

// Use the cn() utility for conditional styles
<div className={cn(
  "color-card",
  isPrimary && "ring-2 ring-primary",
  isSelected && "bg-accent"
)}>
```

### 7. **Testing Considerations**

Design components to be easily testable:

```tsx
// Good: Easily testable component
function ColorCard({ 
  color, 
  onCopyColor, 
  testId 
}: ColorCardProps & { testId?: string }) {
  return (
    <button
      data-testid={testId}
      onClick={() => onCopyColor(color.hex)}
    >
      {/* Component content */}
    </button>
  );
}

// Test example
test('ColorCard copies hex code when clicked', async () => {
  const mockCopy = vi.fn();
  render(
    <ColorCard 
      color={{ hex: '#FF5733', name: 'Red', description: 'Bright red' }}
      onCopyColor={mockCopy}
      testId="color-card"
    />
  );
  
  await user.click(screen.getByTestId('color-card'));
  expect(mockCopy).toHaveBeenCalledWith('#FF5733');
});
```

This component guide provides comprehensive documentation for all components in the Color Palette Generator application, including usage examples, best practices, and implementation patterns.