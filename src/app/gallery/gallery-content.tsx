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
import { PUBLIC_GALLERY_PAGE_SIZE } from '@/config/pagination'
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
}

export function GalleryContent({
  initialImages,
  initialTotal,
  initialHasMore,
}: GalleryContentProps) {
  const [sort, setSort] = useState<GallerySortOrder>('popular')
  const [isSwitchingTabs, setIsSwitchingTabs] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const isInCooldownRef = useRef(false)
  const previousSortRef = useRef<GallerySortOrder>(sort)

  // 始终使用 SSR 获取的初始数据
  const hasInitialData = initialImages.length > 0
  const pageSize = PUBLIC_GALLERY_PAGE_SIZE

  const {
    images,
    total,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePublicGallery(sort, {
    pageSize,
    initialData: hasInitialData
      ? {
          pages: [
            {
              images: initialImages,
              hasMore: initialHasMore,
              total: initialTotal,
              page: 1,
              pageSize,
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
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isInCooldownRef.current
        ) {
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

  // 加载完成后设置冷却期，防止立即触发下一次加载
  useEffect(() => {
    if (isFetchingNextPage) {
      return
    }

    // 加载完成，进入冷却期
    isInCooldownRef.current = true
    const timer = setTimeout(() => {
      isInCooldownRef.current = false
    }, 500)

    return () => clearTimeout(timer)
  }, [isFetchingNextPage])

  // Clear switching state when we have new data
  useEffect(() => {
    if (images.length > 0 && isSwitchingTabs) {
      // Use setTimeout to avoid setState in effect warning
      // This schedules the state update for after the current render cycle
      const timer = setTimeout(() => {
        setIsSwitchingTabs(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [images.length, isSwitchingTabs])

  const handleSortChange = useCallback((newSort: string) => {
    const newSortValue = newSort as GallerySortOrder
    // Detect tab switch and set state synchronously
    if (previousSortRef.current !== newSortValue) {
      setIsSwitchingTabs(true)
      previousSortRef.current = newSortValue
    }
    setSort(newSortValue)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Use initial data on first render, but not when switching tabs
  // When switching tabs, wait for new data from the hook
  const displayImages =
    images.length > 0 ? images : isSwitchingTabs ? [] : initialImages
  const displayTotal = total > 0 ? total : initialTotal

  // Show full loading screen when:
  // 1. Initial load with no data (isLoading && no images)
  // 2. Switching tabs with no data yet (isSwitchingTabs && (isLoading || isFetching) && no images)
  const showGlobalLoading =
    (isLoading && displayImages.length === 0) ||
    (isSwitchingTabs && (isLoading || isFetching) && images.length === 0)

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
            <h2 className="text-base font-normal text-slate-500">
              浏览 AI 生成的微信红包封面，发现热门封面灵感
            </h2>
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

      {/* Gallery Grid - Show images when we have data */}
      {displayImages.length > 0 && !showGlobalLoading && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-3">
            {displayImages.map((image, index) => (
              <PublicGalleryCard
                key={image.id}
                image={image}
                priority={index < 6}
              />
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
