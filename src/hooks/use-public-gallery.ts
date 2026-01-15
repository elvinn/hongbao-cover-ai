import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'

export type GallerySortOrder = 'newest' | 'popular'

export interface PublicGalleryImage {
  id: string
  imageUrl: string
  likesCount: number
  prompt: string
  createdAt: string
}

interface GalleryResponse {
  images: PublicGalleryImage[]
  hasMore: boolean
  total: number
  page: number
  pageSize: number
}

interface UsePublicGalleryOptions {
  initialData?: InfiniteData<GalleryResponse, number>
}

const PAGE_SIZE = 12

async function fetchGalleryImages(
  page: number,
  sort: GallerySortOrder,
): Promise<GalleryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    sort,
  })

  const response = await fetch(`/api/gallery?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '获取图片列表失败')
  }

  return response.json()
}

export function usePublicGallery(
  sort: GallerySortOrder = 'popular',
  options?: UsePublicGalleryOptions,
) {
  // Check if we have actual initial data (not empty)
  // For SSR mode: initialData is provided with images
  // For CSR mode: initialData is undefined, will fetch on mount
  const hasInitialData =
    sort === 'popular' && !!options?.initialData?.pages?.[0]?.images?.length

  const query = useInfiniteQuery({
    queryKey: ['public-gallery', sort],
    queryFn: ({ pageParam }) => fetchGalleryImages(pageParam, sort),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialData: hasInitialData ? options?.initialData : undefined,
    // Prevent refetch on mount when we have SSR data
    // For CSR mode (no initial data), fetch immediately
    staleTime: hasInitialData ? 60 * 1000 : 0, // 1 minute for SSR data
    refetchOnMount: !hasInitialData,
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
