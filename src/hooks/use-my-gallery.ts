import { useInfiniteQuery } from '@tanstack/react-query'

export type GallerySortOrder = 'newest' | 'oldest'

export interface GalleryImage {
  id: string
  url: string | null
  created_at: string
  generation_tasks: {
    prompt: string
    status: string
  } | null
}

interface GalleryResponse {
  images: GalleryImage[]
  hasMore: boolean
  total: number
  page: number
  pageSize: number
}

const PAGE_SIZE = 8

async function fetchGalleryImages(
  page: number,
  sort: GallerySortOrder,
): Promise<GalleryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    sort,
  })

  const response = await fetch(`/api/user/images?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '获取图片列表失败')
  }

  return response.json()
}

export function useMyGallery(sort: GallerySortOrder = 'newest') {
  const query = useInfiniteQuery({
    queryKey: ['my-gallery', sort],
    queryFn: ({ pageParam }) => fetchGalleryImages(pageParam, sort),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1
      }
      return undefined
    },
  })

  // Flatten all pages into a single array of images
  const images = query.data?.pages.flatMap((page) => page.images) ?? []
  const total = query.data?.pages[0]?.total ?? 0

  return {
    images,
    total,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
