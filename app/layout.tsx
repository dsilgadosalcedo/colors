import type React from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Geist } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import { Viewport } from 'next'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { generateMetadata, generateStructuredData, siteConfig } from '@/lib/seo'
import { VercelAnalytics, VercelSpeedInsights } from '@/lib/analytics'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { validateEnv } from '@/lib/validations'
import Script from 'next/script'
import { PostHogProvider } from '@/components/PostHogProvider'

// Validate environment variables on startup
if (typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (error) {
    console.error('Environment validation failed:', error)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

// Enhanced SEO metadata
export const metadata = generateMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

// Structured data for the application
const structuredData = generateStructuredData({
  type: 'WebApplication',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  image: siteConfig.ogImage,
  additionalData: {
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Modern browser recommended.',
    featureList: [
      'AI-powered color extraction from images',
      'Text-to-color palette generation',
      'Color palette editing and customization',
      'Export in multiple formats',
      'Accessibility-focused design',
    ],
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Web Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        {/* Additional SEO tags */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <PostHogProvider>
              {children}
              <Toaster />
            </PostHogProvider>
          </ThemeProvider>
        </ErrorBoundary>

        {/* Performance Monitoring */}
        <PerformanceMonitor />
        {/* <VercelAnalytics /> */}
        {/* <VercelSpeedInsights /> */}

        {/* Web Vitals Tracking */}
        {/* <Script
          id="web-vitals"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              import('/lib/analytics').then(({ initWebVitals }) => {
                initWebVitals();
              });
            `,
          }}
        /> */}
      </body>
    </html>
  )
}
