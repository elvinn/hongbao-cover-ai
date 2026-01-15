import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import { getCdnUrl } from '@/utils/r2-storage'
import { PUBLIC_GALLERY_PAGE_SIZE } from '@/config/pagination'

const CDN_DOMAIN = process.env.R2_CDN_DOMAIN || ''
const DEFAULT_PAGE_SIZE = PUBLIC_GALLERY_PAGE_SIZE

/**
 * GET /api/gallery - 获取公开画廊图片列表（支持分页和排序）
 *
 * Query params:
 * - sort: 'newest' | 'popular' (default: 'popular')
 * - page: number (default: 1)
 * - pageSize: number (default: 6, max: 50)
 *
 * 返回公开的图片列表（原图）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'popular'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(
      50,
      Math.max(
        1,
        parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10),
      ),
    )

    // 获取当前用户 ID（可选，未登录时为 null）
    const { userId } = await auth()

    const offset = (page - 1) * pageSize
    const supabase = createServiceRoleClient()

    // 获取公开图片总数
    const { count: total, error: countError } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)

    if (countError) {
      console.error('Failed to count images:', countError)
      return NextResponse.json(
        { error: 'FETCH_FAILED', message: '获取图片列表失败' },
        { status: 500 },
      )
    }

    // 构建查询
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

    // 排序
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else {
      // popular - 按点赞数排序，相同点赞数按时间排序
      query = query
        .order('likes_count', { ascending: false })
        .order('created_at', { ascending: false })
    }

    // 分页
    const { data: images, error: imagesError } = await query.range(
      offset,
      offset + pageSize - 1,
    )

    if (imagesError) {
      console.error('Failed to fetch images:', imagesError)
      return NextResponse.json(
        { error: 'FETCH_FAILED', message: '获取图片列表失败' },
        { status: 500 },
      )
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

    // 处理图片 URL（使用原图 CDN URL）
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

    return NextResponse.json({
      images: processedImages,
      hasMore,
      total: totalCount,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Get gallery error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '获取图片列表失败，请稍后重试' },
      { status: 500 },
    )
  }
}
