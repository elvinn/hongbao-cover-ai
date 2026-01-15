import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import { getCdnUrl } from '@/utils/r2-storage'

const CDN_DOMAIN = process.env.R2_CDN_DOMAIN || ''
const DEFAULT_PAGE_SIZE = 12

/**
 * GET /api/user/images - 获取用户的图片列表（支持分页和排序）
 *
 * Query params:
 * - sort: 'newest' | 'oldest' (default: 'newest')
 * - page: number (default: 1)
 * - pageSize: number (default: 12)
 *
 * 返回的 url 字段（通过 CDN 提供）：
 * - 付费用户：{R2_CDN_DOMAIN}/{original_key}（无水印原图）
 * - 免费用户：{R2_CDN_DOMAIN}/{preview_key}（带水印预览图）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份（使用 Clerk）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(
      50,
      Math.max(
        1,
        parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10),
      ),
    )

    const ascending = sort === 'oldest'
    const offset = (page - 1) * pageSize

    const supabase = createServiceRoleClient()

    // 获取用户信息，判断是否为付费用户
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('access_level')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Failed to fetch user:', userError)
      return NextResponse.json(
        { error: 'FETCH_FAILED', message: '获取用户信息失败' },
        { status: 500 },
      )
    }

    const isPremium = userData?.access_level === 'premium'

    // 获取总数
    const { count: total, error: countError } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      console.error('Failed to count images:', countError)
      return NextResponse.json(
        { error: 'FETCH_FAILED', message: '获取图片列表失败' },
        { status: 500 },
      )
    }

    // 获取分页数据
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select(
        `
        id,
        preview_key,
        original_key,
        is_public,
        created_at,
        generation_tasks (
          prompt,
          status
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending })
      .range(offset, offset + pageSize - 1)

    if (imagesError) {
      console.error('Failed to fetch images:', imagesError)
      return NextResponse.json(
        { error: 'FETCH_FAILED', message: '获取图片列表失败' },
        { status: 500 },
      )
    }

    // 根据用户类型处理图片 URL（使用 CDN）
    const processedImages = (images || []).map((image) => {
      let url: string | null = null

      if (isPremium && image.original_key) {
        // 付费用户：使用原图 CDN URL（无水印）
        url = getCdnUrl(image.original_key, CDN_DOMAIN)
      } else if (image.preview_key) {
        // 免费用户：使用预览图 CDN URL（带水印）
        url = getCdnUrl(image.preview_key, CDN_DOMAIN)
      }

      return {
        id: image.id,
        url,
        is_public: image.is_public,
        created_at: image.created_at,
        generation_tasks: image.generation_tasks,
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
    console.error('Get images error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '获取图片列表失败，请稍后重试' },
      { status: 500 },
    )
  }
}
