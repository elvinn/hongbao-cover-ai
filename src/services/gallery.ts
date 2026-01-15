import { createServiceRoleClient } from '@/supabase/server'
import { getCdnUrl } from '@/utils/r2-storage'

const CDN_DOMAIN = process.env.R2_CDN_DOMAIN || ''
const DEFAULT_PAGE_SIZE = 12

export interface GalleryImage {
  id: string
  imageUrl: string
  likesCount: number
  prompt: string
  createdAt: string
}

export interface GalleryResponse {
  images: GalleryImage[]
  hasMore: boolean
  total: number
  page: number
  pageSize: number
}

export type GallerySortOrder = 'newest' | 'popular'

/**
 * Fetch public gallery images (server-side)
 */
export async function fetchPublicGalleryImages(
  sort: GallerySortOrder = 'popular',
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<GalleryResponse> {
  const offset = (page - 1) * pageSize
  const supabase = createServiceRoleClient()

  // Get total count
  const { count: total, error: countError } = await supabase
    .from('images')
    .select('*', { count: 'exact', head: true })
    .eq('is_public', true)

  if (countError) {
    console.error('Failed to count images:', countError)
    throw new Error('获取图片列表失败')
  }

  // Build query
  let query = supabase
    .from('images')
    .select(
      `
      id,
      preview_key,
      original_key,
      likes_count,
      created_at,
      generation_tasks (
        prompt
      )
    `,
    )
    .eq('is_public', true)

  // Sort
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    // popular - sort by likes, then by date
    query = query
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: false })
  }

  // Pagination
  const { data: images, error: imagesError } = await query.range(
    offset,
    offset + pageSize - 1,
  )

  if (imagesError) {
    console.error('Failed to fetch images:', imagesError)
    throw new Error('获取图片列表失败')
  }

  // Process image URLs
  const processedImages = (images || []).map((image) => {
    const imageUrl = image.preview_key
      ? getCdnUrl(image.preview_key, CDN_DOMAIN)
      : getCdnUrl(image.original_key, CDN_DOMAIN)

    // generation_tasks is an array from the join, get the first element
    const generationTask = Array.isArray(image.generation_tasks)
      ? image.generation_tasks[0]
      : image.generation_tasks

    return {
      id: image.id,
      imageUrl,
      likesCount: image.likes_count,
      prompt: generationTask?.prompt || '',
      createdAt: image.created_at,
    }
  })

  const totalCount = total || 0
  const hasMore = offset + pageSize < totalCount

  return {
    images: processedImages,
    hasMore,
    total: totalCount,
    page,
    pageSize,
  }
}
