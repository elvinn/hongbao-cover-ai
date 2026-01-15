'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, ImageIcon, Loader2, Sparkles } from 'lucide-react'
import { PublicGalleryCard } from '@/components/public-gallery-card'
import {
  usePublicGallery,
  type GallerySortOrder,
  type PublicGalleryImage,
} from '@/hooks/use-public-gallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  SegmentToggle,
  type SegmentOption,
} from '@/components/ui/segment-toggle'

interface GalleryContentProps {
  initialImages: PublicGalleryImage[]
  initialTotal: number
  initialHasMore: boolean
  isSSR: boolean
}

export function GalleryContent({
  initialImages,
  initialTotal,
  initialHasMore,
  isSSR,
}: GalleryContentProps) {
  const [sort, setSort] = useState<GallerySortOrder>('popular')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Only provide initial data for SSR mode (bots/crawlers)
  const hasInitialData = isSSR && initialImages.length > 0

  const {
    images,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePublicGallery(sort, {
    initialData: hasInitialData
      ? {
          pages: [
            {
              images: initialImages,
              hasMore: initialHasMore,
              total: initialTotal,
              page: 1,
              pageSize: 12,
            },
          ],
          pageParams: [1],
        }
      : undefined,
  })

  const sortOptions: SegmentOption<GallerySortOrder>[] = [
    { value: 'popular', label: '热门排行' },
    { value: 'newest', label: '最新发布' },
  ]

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

  // Use initial data on first render, then use hook data
  const displayImages = images.length > 0 ? images : initialImages
  const displayTotal = total > 0 ? total : initialTotal

  // Show loading state for CSR mode (non-bot users)
  const showGlobalLoading = isLoading && !isSSR && displayImages.length === 0

  return (
    <>
      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                封面广场
              </h1>
              {!showGlobalLoading && (
                <Badge
                  variant="secondary"
                  className="border-red-100 bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  {displayTotal}
                </Badge>
              )}
            </div>
            <p className="text-base text-slate-500">
              探索由 AI 创作的精美微信红包封面作品
            </p>
          </div>

          {/* Sort Toggle */}
          <div className="flex items-center self-start sm:self-auto">
            <SegmentToggle
              options={sortOptions}
              value={sort}
              onChange={handleSortChange}
            />
          </div>
        </div>
      </header>

      {/* Global Loading for CSR mode */}
      {showGlobalLoading && (
        <div className="flex min-h-[45vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      )}

      {/* Empty State */}
      {displayImages.length === 0 && !isLoading && !showGlobalLoading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 py-20 text-center backdrop-blur-sm">
          <div className="mb-6 rounded-2xl bg-red-50 p-4 ring-8 ring-red-50/50">
            <ImageIcon className="h-12 w-12 text-red-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            暂无公开作品
          </h2>
          <p className="mb-8 max-w-sm text-slate-500">
            还没有用户公开自己的封面，快来成为第一个分享者吧！
          </p>
          <Button
            asChild
            size="lg"
            className="hb-btn-primary h-12 px-8 text-base shadow-lg shadow-red-500/20"
          >
            <Link href="/">
              <Sparkles className="mr-2 h-5 w-5" />
              去生成封面
            </Link>
          </Button>
        </div>
      )}

      {/* Gallery Grid */}
      {displayImages.length > 0 && !showGlobalLoading && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {displayImages.map((image) => (
              <PublicGalleryCard key={image.id} image={image} />
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
    </>
  )
}
