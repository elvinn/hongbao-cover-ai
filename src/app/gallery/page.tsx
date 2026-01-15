import { headers } from 'next/headers'
import { fetchPublicGalleryImages } from '@/services/gallery'
import { isBot } from '@/utils/bot-detection'
import { GalleryContent } from './gallery-content'

export default async function GalleryPage() {
  // Check if request is from a bot/crawler
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const shouldSSR = isBot(userAgent)

  // Only fetch data on server for bots (SEO), regular users use CSR
  const initialData = shouldSSR
    ? await fetchPublicGalleryImages('popular', 1, 12)
    : null

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
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
