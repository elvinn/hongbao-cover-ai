import { headers } from 'next/headers'
import { fetchPublicGalleryImages } from '@/services/gallery'
import { PUBLIC_GALLERY_SSR_BOT_PAGE_SIZE } from '@/config/pagination'
import { isBot } from '@/utils/bot-detection'
import { GalleryContent } from './gallery-content'

export default async function GalleryPage() {
  // Check if request is from a bot/crawler
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const shouldSSR = isBot(userAgent)
  const baseUrl = process.env.VERCEL_URL
    ? 'https://hongbao.elvinn.wiki'
    : 'http://localhost:3000'

  // Only fetch data on server for bots (SEO), regular users use CSR
  const initialData = shouldSSR
    ? await fetchPublicGalleryImages(
        'popular',
        1,
        PUBLIC_GALLERY_SSR_BOT_PAGE_SIZE,
      )
    : null
  const hasInitialImages = !!initialData?.images?.length
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '封面广场 - 热门红包封面作品精选',
    description:
      '浏览 AI 生成的微信红包封面作品，发现热门封面与创作灵感，快速开启你的专属红包封面制作。',
    url: `${baseUrl}/gallery`,
  }
  const itemListJsonLd = hasInitialImages
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: '热门红包封面作品精选',
        itemListElement: initialData.images.map((image, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${baseUrl}/cover/${image.id}`,
          image: image.imageUrl,
          name: image.prompt?.trim()
            ? `红包封面：${image.prompt.trim()}`
            : '红包封面',
        })),
      }
    : null
  const structuredData = itemListJsonLd
    ? [collectionJsonLd, itemListJsonLd]
    : [collectionJsonLd]

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-16">
        <GalleryContent
          initialImages={initialData?.images ?? []}
          initialTotal={initialData?.total ?? 0}
          initialHasMore={initialData?.hasMore ?? true}
          isSSR={shouldSSR}
        />
      </div>
    </main>
  )
}
