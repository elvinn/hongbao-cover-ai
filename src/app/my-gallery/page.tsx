'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { ChevronDown, ImageIcon, Loader2, Sparkles } from 'lucide-react'
import { GalleryCard } from '@/components/gallery-card'
import { GallerySkeleton } from '@/components/gallery-skeleton'
import { useMyGallery, type GallerySortOrder } from '@/hooks/use-my-gallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  SegmentToggle,
  type SegmentOption,
} from '@/components/ui/segment-toggle'

export default function MyGalleryPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const [sort, setSort] = useState<GallerySortOrder>('newest')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    images,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useMyGallery(sort)

  // Redirect unauthenticated users to homepage
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, router])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort as GallerySortOrder)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const sortOptions: SegmentOption<GallerySortOrder>[] = [
    { value: 'newest', label: '最新发布' },
    { value: 'oldest', label: '最早发布' },
  ]

  // Show loading while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </main>
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-16">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  我的封面
                </h1>
                {!isLoading && (
                  <Badge
                    variant="secondary"
                    className="border-red-100 bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    {total}
                  </Badge>
                )}
              </div>
              {!isLoading && (
                <p className="text-base text-slate-500">
                  共创作了 {total} 件独一无二的封面设计
                </p>
              )}
            </div>

            {/* Sort Toggle */}
            {images.length > 0 && (
              <div className="flex items-center self-start sm:self-auto">
                <SegmentToggle
                  options={sortOptions}
                  value={sort}
                  onChange={handleSortChange}
                />
              </div>
            )}
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="mb-10 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 py-20 text-center backdrop-blur-sm">
            <div className="mb-6 rounded-2xl bg-red-50 p-4 ring-8 ring-red-50/50">
              <ImageIcon className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              还没有生成过封面
            </h2>
            <p className="mb-8 max-w-sm text-slate-500">
              快去体验 AI 生成红包封面的魔法吧，只需输入描述，即可获得专属封面
            </p>
            <Button
              asChild
              size="lg"
              className="hb-btn-primary h-12 px-8 text-base shadow-lg shadow-red-500/20"
            >
              <Link href="/">
                <Sparkles className="mr-2 h-5 w-5" />
                立即体验
              </Link>
            </Button>
          </div>
        )}

        {/* Gallery Grid */}
        {images.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-3">
              {images.map((image) => (
                <GalleryCard key={image.id} image={image} />
              ))}
            </div>

            {/* Load More Section */}
            <div
              ref={loadMoreRef}
              className="mt-16 flex flex-col items-center justify-center pb-8"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center gap-3 rounded-full border border-slate-100 bg-white px-6 py-3 shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                  <span className="text-sm font-bold text-slate-600">
                    加载中...
                  </span>
                </div>
              ) : hasNextPage ? (
                <button
                  onClick={handleLoadMore}
                  className="group flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-red-200 hover:text-red-500 hover:shadow-md"
                >
                  加载更多作品
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-slate-200" />
                  <p className="text-sm font-medium text-slate-400 italic">
                    已加载全部作品
                  </p>
                  <div className="h-px w-8 bg-slate-200" />
                </div>
              )}
            </div>
          </>
        )}

        {/* Initial Loading State */}
        {isLoading && images.length === 0 && <GallerySkeleton />}
      </div>
    </main>
  )
}
