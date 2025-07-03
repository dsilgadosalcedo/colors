# Development Guide

Complete guide for developing, testing, and deploying the Color Palette Generator application.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing Guide](#testing-guide)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Recommended package manager (or npm/yarn)
- **Google AI API Key**: Required for palette generation
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd color-palette-generator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Bundle analysis
pnpm analyze
```

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── actions.ts         # Server actions
│   ├── api/               # API routes
│   │   ├── analytics/     # Analytics endpoints
│   │   └── generate/      # Palette generation API
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── global-error.tsx   # Global error boundary
│   └── sitemap.ts         # Sitemap generation
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── ImageUpload/      # Image upload component
│   ├── color-card.tsx    # Color display component
│   ├── color-palette.tsx # Palette display component
│   └── ...               # Other components
├── hooks/                # Custom React hooks
│   ├── use-mobile.tsx    # Mobile detection hook
│   └── use-toast.ts      # Toast notification hook
├── lib/                  # Utility libraries
│   ├── server/           # Server-side utilities
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # Type definitions
│   ├── utils.ts          # Utility functions
│   ├── validations.ts    # Zod validation schemas
│   └── ...               # Other utilities
├── styles/               # Global styles
├── public/               # Static assets
├── __tests__/            # Test files
├── docs/                 # Documentation
└── package.json          # Dependencies and scripts
```

### Key Directories Explained

- **`app/`**: Next.js App Router structure with pages and API routes
- **`components/`**: All React components, organized by functionality
- **`hooks/`**: Custom React hooks for reusable logic
- **`lib/`**: Utility functions, configurations, and shared logic
- **`styles/`**: Global CSS and Tailwind configuration
- **`public/`**: Static assets like images and icons
- **`__tests__/`**: Test files following the same structure as `app/`

---

## 🔄 Development Workflow

### 1. **Feature Development**

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. Develop your feature following the established patterns
3. Write tests for new functionality
4. Ensure all tests pass and linting is clean
5. Create a pull request

### 2. **Code Style Guidelines**

#### TypeScript Best Practices
```typescript
// Use explicit return types for functions
function generatePalette(colors: ColorInfo[]): ColorPalette {
  return {
    colors,
    dominantColor: colors[0].hex,
    mood: 'vibrant'
  };
}

// Use proper typing for component props
interface ComponentProps {
  title: string;
  isActive?: boolean;
  onAction: (id: string) => void;
}

// Use enums for constants
enum PaletteStatus {
  GENERATING = 'generating',
  COMPLETE = 'complete',
  ERROR = 'error'
}
```

#### React Component Patterns
```tsx
// Functional components with TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant, children, onClick }: ButtonProps) {
  return (
    <button
      className={cn('base-styles', variant === 'primary' && 'primary-styles')}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Custom hooks pattern
function usePaletteGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePalette = useCallback(async (imageData: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Generation logic
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generatePalette, isLoading, error };
}
```

### 3. **State Management Patterns**

#### Zustand Store Structure
```typescript
// Define clear interfaces
interface StoreState {
  // Data
  palettes: ColorPalette[];
  currentPalette: ColorPalette | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPalettes: (palettes: ColorPalette[]) => void;
  addPalette: (palette: ColorPalette) => void;
  setError: (error: string | null) => void;
}

// Use middleware for persistence
export const usePaletteStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      palettes: [],
      currentPalette: null,
      isLoading: false,
      error: null,
      
      // Actions
      setPalettes: (palettes) => set({ palettes }),
      addPalette: (palette) => set((state) => ({
        palettes: [palette, ...state.palettes]
      })),
      setError: (error) => set({ error })
    }),
    {
      name: 'palette-storage',
      partialize: (state) => ({ palettes: state.palettes })
    }
  )
);
```

---

## 🧪 Testing Guide

### Testing Stack

- **Jest**: Test runner and assertions
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Additional DOM matchers

### Test Structure

```
__tests__/
├── components/
│   ├── ImageUpload.test.tsx
│   ├── ColorCard.test.tsx
│   └── ColorPalette.test.tsx
├── hooks/
│   ├── useMobile.test.ts
│   └── useToast.test.ts
├── lib/
│   ├── store.test.ts
│   ├── utils.test.ts
│   └── validations.test.ts
└── api/
    ├── generate.test.ts
    └── analytics.test.ts
```

### Testing Examples

#### Component Testing
```tsx
// __tests__/components/ColorCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorCard } from '@/components/color-card';

const mockColor = {
  hex: '#FF5733',
  name: 'Vibrant Red',
  description: 'A bright, energetic red color'
};

describe('ColorCard', () => {
  it('renders color information correctly', () => {
    render(
      <ColorCard
        color={mockColor}
        copiedColor={null}
        onCopyColor={vi.fn()}
      />
    );

    expect(screen.getByText('Vibrant Red')).toBeInTheDocument();
    expect(screen.getByText('#FF5733')).toBeInTheDocument();
  });

  it('calls onCopyColor when clicked', async () => {
    const mockCopyColor = vi.fn();
    const user = userEvent.setup();

    render(
      <ColorCard
        color={mockColor}
        copiedColor={null}
        onCopyColor={mockCopyColor}
      />
    );

    await user.click(screen.getByRole('button'));
    expect(mockCopyColor).toHaveBeenCalledWith('#FF5733');
  });

  it('shows copied state when color is copied', () => {
    render(
      <ColorCard
        color={mockColor}
        copiedColor="#FF5733"
        onCopyColor={vi.fn()}
      />
    );

    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });
});
```

#### Hook Testing
```tsx
// __tests__/hooks/useMobile.test.ts
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('useIsMobile', () => {
  beforeEach(() => {
    mockMatchMedia.mockClear();
  });

  it('returns false for desktop width', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile width', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});
```

#### API Testing
```tsx
// __tests__/api/generate.test.ts
import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';

describe('/api/generate', () => {
  it('generates palette from valid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        imageDataUrl: 'data:image/jpeg;base64,test',
        defaultColorCount: 5,
        userPrompt: 'sunset colors'
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.colors).toHaveLength(5);
  });

  it('returns error for invalid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### Test Configuration

#### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Test Setup (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));
```

---

## ⚡ Performance Optimization

### 1. **Code Splitting**

```tsx
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 2. **Image Optimization**

```tsx
// Use Next.js Image component
import Image from 'next/image';

function PalettePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={200}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

### 3. **Bundle Analysis**

```bash
# Analyze bundle size
pnpm analyze

# Analyze server bundle
pnpm analyze:server

# Analyze browser bundle
pnpm analyze:browser
```

### 4. **Performance Monitoring**

```tsx
// Core Web Vitals tracking
import { PerformanceMonitor } from '@/components/performance-monitor';

function App() {
  return (
    <>
      <PerformanceMonitor />
      {/* App content */}
    </>
  );
}
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect GitHub repository**
   - Link your GitHub repository to Vercel
   - Configure automatic deployments

2. **Set environment variables**
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your_key
   NEXT_PUBLIC_POSTHOG_KEY=your_key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

3. **Deploy**
   - Push to main branch for automatic deployment
   - Or use Vercel CLI: `vercel --prod`

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Build succeeds without errors
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Security headers configured
- [ ] Analytics tracking verified
- [ ] Error monitoring active

---

## 🔧 Environment Configuration

### Environment Variables

#### Required Variables
```env
# AI Service
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key

# Analytics (Optional but recommended)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Deployment (Set automatically by Vercel)
NEXT_PUBLIC_VERCEL_URL=your_deployment_url
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=commit_hash
```

#### Development Variables
```env
# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

#### Production Variables
```env
# Production
NODE_ENV=production
NEXT_PUBLIC_DEBUG=false
```

### Configuration Files

#### Next.js Configuration (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable App Router
    appDir: true,
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Bundle analysis
  env: {
    ANALYZE: process.env.ANALYZE,
  },
};

export default nextConfig;
```

#### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **API Key Issues**
```bash
# Error: "API key not found"
# Solution: Check .env.local file
cat .env.local | grep GOOGLE_GENERATIVE_AI_API_KEY

# Ensure key is properly formatted
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

#### 2. **Build Errors**
```bash
# Type errors
pnpm type-check

# Linting errors
pnpm lint

# Dependency issues
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 3. **Performance Issues**
```bash
# Analyze bundle size
pnpm analyze

# Check for memory leaks
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

#### 4. **Deployment Issues**
```bash
# Vercel deployment logs
vercel logs

# Local production build
pnpm build && pnpm start
```

### Debug Configuration

#### Development Debug Mode
```typescript
// lib/debug.ts
export const DEBUG = process.env.NODE_ENV === 'development';

export function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}
```

#### Error Monitoring
```typescript
// lib/error-monitoring.ts
export function captureError(error: Error, context?: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to error monitoring service
    console.error('Production error:', error, context);
  } else {
    console.error('Development error:', error, context);
  }
}
```

### Support Resources

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive API and component documentation
- **Community**: Join discussions and get help
- **Performance**: Monitor Core Web Vitals and user experience

This development guide provides all the necessary information for setting up, developing, testing, and deploying the Color Palette Generator application successfully.