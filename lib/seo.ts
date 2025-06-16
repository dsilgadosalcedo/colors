import { Metadata } from 'next'

// Base SEO configuration
export const siteConfig = {
  name: 'AI Color Palette Generator',
  description:
    'Generate stunning color palettes from images or text descriptions using AI. Create, customize, and export professional color schemes for your design projects.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://colors.example.com',
  ogImage: '/og-image.png',
  creator: 'Arrecifes',
  keywords: [
    'color palette',
    'color generator',
    'AI colors',
    'design tools',
    'color extraction',
    'color harmony',
    'design inspiration',
    'color schemes',
    'palette generator',
    'web design',
    'graphic design',
    'color theory',
  ],
} as const

// Generate metadata for pages
export function generateMetadata({
  title,
  description,
  image,
  path = '',
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const url = `${siteConfig.url}${path}`
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name

  return {
    title: fullTitle,
    description: description || siteConfig.description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,

    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: fullTitle,
      description: description || siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: image || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || siteConfig.description,
      images: [image || siteConfig.ogImage],
      creator: '@arrecifes', // Replace with actual Twitter handle
    },

    // Additional meta tags
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },

    // App-specific
    applicationName: siteConfig.name,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: siteConfig.name,
    },
    formatDetection: {
      telephone: false,
    },
  }
}

// Generate structured data (JSON-LD)
export function generateStructuredData({
  type = 'WebApplication',
  name,
  description,
  url,
  image,
  additionalData = {},
}: {
  type?: 'WebApplication' | 'CreativeWork' | 'SoftwareApplication'
  name: string
  description: string
  url: string
  image?: string
  additionalData?: Record<string, unknown>
}) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    url,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: siteConfig.creator,
    },
  }

  if (image) {
    ;(baseData as Record<string, unknown>).image = image
  }

  return {
    ...baseData,
    ...additionalData,
  }
}

// Color palette specific structured data
export function generatePaletteStructuredData(palette: {
  colors: string[]
  name?: string
  description?: string
}) {
  return generateStructuredData({
    type: 'CreativeWork',
    name: palette.name || 'AI Generated Color Palette',
    description:
      palette.description ||
      `A color palette with ${palette.colors.length} colors: ${palette.colors.join(', ')}`,
    url: siteConfig.url,
    additionalData: {
      '@type': 'CreativeWork',
      creativeWorkStatus: 'Published',
      dateCreated: new Date().toISOString(),
      keywords: [...siteConfig.keywords, ...palette.colors],
      color: palette.colors,
      numberOfColors: palette.colors.length,
    },
  })
}

// Generate sitemap data
export const sitemapRoutes = [
  {
    url: '/',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  },
  // Add more routes as needed
] as const
