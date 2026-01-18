import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/sign-in/', '/sign-up/', '/pricing/success'],
    },
    sitemap: 'https://hongbao.elvinn.wiki/sitemap.xml',
  }
}
