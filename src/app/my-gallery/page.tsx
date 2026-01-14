'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { ChevronDown, ImageIcon, Loader2, Sparkles } from 'lucide-react'
import { GalleryCard } from '@/components/gallery-card'
import { useMyGallery, type GallerySortOrder } from '@/hooks/use-my-gallery'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

export default function GalleryPage() {
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

  const handleSortChange = useCallback((newSort: GallerySortOrder) => {
    setSort(newSort)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Show loading while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
                我的封面
              </h1>
              {!isLoading && (
                <p className="text-muted-foreground mt-1 text-sm">
                  共创作了 {total} 件独一无二的封面设计
                </p>
              )}
            </div>

            {/* Sort Toggle */}
            {images.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">排序方式:</span>
                <div className="flex gap-1 rounded-lg bg-amber-50/50 p-1">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={cn(
                      'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      sort === 'newest'
                        ? 'bg-white text-amber-900 shadow-sm'
                        : 'text-amber-700 hover:text-amber-900',
                    )}
                  >
                    最新
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className={cn(
                      'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      sort === 'oldest'
                        ? 'bg-white text-amber-900 shadow-sm'
                        : 'text-amber-700 hover:text-amber-900',
                    )}
                  >
                    最早
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg bg-red-50/70 p-4 text-center text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground mt-4 text-sm">加载中...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && (
          <div className="hb-card flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="bg-primary/10 mb-6 rounded-full p-4">
              <ImageIcon className="text-primary h-12 w-12" />
            </div>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              还没有生成过封面
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              快去体验 AI 生成红包封面的魔法吧，只需输入描述，即可获得专属封面
            </p>
            <Button asChild className="hb-btn-primary">
              <Link href="/">
                <Sparkles className="mr-2 h-4 w-4" />
                立即体验
              </Link>
            </Button>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && images.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {images.map((image) => (
                <GalleryCard key={image.id} image={image} />
              ))}
            </div>

            {/* Load More Section */}
            <div
              ref={loadMoreRef}
              className="mt-10 flex flex-col items-center justify-center"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2">
                  <Loader2 className="text-primary h-5 w-5 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    加载更多...
                  </span>
                </div>
              )}

              {hasNextPage && !isFetchingNextPage && (
                <button
                  onClick={handleLoadMore}
                  className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-sm transition-colors"
                >
                  加载更多作品
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}

              {!hasNextPage && images.length > 0 && (
                <p className="text-muted-foreground text-sm">已加载全部作品</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
