import { auth } from '@clerk/nextjs/server'
import { fetchPublicGalleryImages } from '@/services/gallery'
import { PUBLIC_GALLERY_PAGE_SIZE } from '@/config/pagination'
import { GalleryContent } from './gallery-content'

export default async function GalleryPage() {
  // 获取用户登录状态
  const { userId } = await auth()

  const baseUrl = process.env.VERCEL_URL
    ? 'https://hongbao.elvinn.wiki'
    : 'http://localhost:3000'

  // 始终在服务端获取首屏数据（含用户点赞状态）
  const initialData = await fetchPublicGalleryImages(
    'popular',
    1,
    PUBLIC_GALLERY_PAGE_SIZE,
    userId,
  )

  const hasInitialImages = initialData.images.length > 0
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
          initialImages={initialData.images}
          initialTotal={initialData.total}
          initialHasMore={initialData.hasMore}
        />
      </div>
    </main>
  )
}
