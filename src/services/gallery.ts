import { clerkClient } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import { getCdnUrl } from '@/utils/r2-storage'
import { getOptimizedImageUrl } from '@/utils/cdn'
import { PUBLIC_GALLERY_PAGE_SIZE } from '@/config/pagination'

const CDN_DOMAIN = process.env.R2_CDN_DOMAIN || ''
const DEFAULT_PAGE_SIZE = PUBLIC_GALLERY_PAGE_SIZE

export interface GalleryImage {
  id: string
  imageUrl: string
  likesCount: number
  prompt: string
  createdAt: string
  hasLiked: boolean
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
 *
 * @param sort - 排序方式
 * @param page - 页码
 * @param pageSize - 每页数量
 * @param userId - 用户 ID（可选，用于查询点赞状态）
 */
export async function fetchPublicGalleryImages(
  sort: GallerySortOrder = 'popular',
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  userId?: string | null,
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

  // 如果用户已登录，批量查询点赞状态
  let likedImageIds: Set<string> = new Set()
  if (userId && images && images.length > 0) {
    const imageIds = images.map((img) => img.id)
    const { data: likes } = await supabase
      .from('image_likes')
      .select('image_id')
      .eq('user_id', userId)
      .in('image_id', imageIds)

    likedImageIds = new Set(likes?.map((l) => l.image_id) || [])
  }

  // Process image URLs (use original images)
  const processedImages = (images || []).map((image) => {
    const imageUrl = image.original_key
      ? getCdnUrl(image.original_key, CDN_DOMAIN)
      : getCdnUrl(image.preview_key, CDN_DOMAIN)

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
      hasLiked: likedImageIds.has(image.id),
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

/**
 * 封面详情接口
 */
export interface CoverDetail {
  id: string
  imageUrl: string
  prompt: string
  likesCount: number
  hasLiked: boolean
  isOwner: boolean
  createdAt: string
  creator: {
    nickname: string
    avatarUrl: string | null
  }
}

export type FetchCoverDetailResult =
  | { success: true; data: CoverDetail }
  | { success: false; error: 'NOT_FOUND' | 'SERVER_ERROR'; message: string }

/**
 * Fetch cover detail (server-side)
 *
 * @param imageId - 图片 ID
 * @param userId - 用户 ID（可选，用于查询点赞状态和判断是否为所有者）
 */
export async function fetchCoverDetail(
  imageId: string,
  userId?: string | null,
): Promise<FetchCoverDetailResult> {
  try {
    if (!imageId) {
      return {
        success: false,
        error: 'NOT_FOUND',
        message: '请提供有效的图片 ID',
      }
    }

    const supabase = createServiceRoleClient()

    // 获取图片详情（包含生成任务信息）
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select(
        `
        id,
        preview_key,
        original_key,
        is_public,
        likes_count,
        created_at,
        user_id,
        generation_tasks (
          prompt
        )
      `,
      )
      .eq('id', imageId)
      .single()

    if (imageError || !image) {
      return {
        success: false,
        error: 'NOT_FOUND',
        message: '封面不存在',
      }
    }

    // 检查是否公开（或者是用户自己的图片）
    const isOwner = !!(userId && image.user_id === userId)

    if (!image.is_public && !isOwner) {
      return {
        success: false,
        error: 'NOT_FOUND',
        message: '封面不存在或未公开',
      }
    }

    // 检查当前用户是否已点赞
    let hasLiked = false
    if (userId) {
      const { data: likeData } = await supabase
        .from('image_likes')
        .select('id')
        .eq('image_id', imageId)
        .eq('user_id', userId)
        .single()

      hasLiked = !!likeData
    }

    // 获取创作者信息
    let creator: { nickname: string; avatarUrl: string | null } = {
      nickname: '匿名用户',
      avatarUrl: null,
    }

    try {
      const client = await clerkClient()
      const creatorUser = await client.users.getUser(image.user_id)
      creator = {
        nickname:
          creatorUser.username ||
          creatorUser.firstName ||
          `用户${image.user_id.slice(-6)}`,
        avatarUrl: creatorUser.imageUrl || null,
      }
    } catch (error) {
      console.error('Failed to fetch creator info:', error)
      // 获取用户信息失败，使用默认值
    }

    // 返回预览图 URL（带水印，优化后）
    const rawUrl = image.preview_key
      ? getCdnUrl(image.preview_key, CDN_DOMAIN)
      : getCdnUrl(image.original_key, CDN_DOMAIN)
    const imageUrl = getOptimizedImageUrl(rawUrl)

    // generation_tasks is an array from the join, get the first element
    const generationTask = Array.isArray(image.generation_tasks)
      ? image.generation_tasks[0]
      : image.generation_tasks

    return {
      success: true,
      data: {
        id: image.id,
        imageUrl,
        prompt: generationTask?.prompt || '',
        likesCount: image.likes_count,
        hasLiked,
        isOwner,
        createdAt: image.created_at,
        creator,
      },
    }
  } catch (error) {
    console.error('Get cover detail error:', error)
    return {
      success: false,
      error: 'SERVER_ERROR',
      message: '获取封面详情失败，请稍后重试',
    }
  }
}
