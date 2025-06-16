import { MetadataRoute } from 'next'
import { siteConfig, sitemapRoutes } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Static routes from configuration
  const staticRoutes = sitemapRoutes.map(route => ({
    url: `${baseUrl}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // You can add dynamic routes here
  // For example, if you have individual palette pages:
  // const dynamicRoutes = await getPalettePages()

  return [...staticRoutes]
}
