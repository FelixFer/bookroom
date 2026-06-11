import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/collection/'],
    },
    sitemap: 'https://mybookroom.vercel.app/sitemap.xml',
  }
}
