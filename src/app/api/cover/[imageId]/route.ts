import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import { getCdnUrl } from '@/utils/r2-storage'
import { getOptimizedImageUrl } from '@/utils/cdn'

const CDN_DOMAIN = process.env.R2_CDN_DOMAIN || ''

interface RouteParams {
  params: Promise<{ imageId: string }>
}

/**
 * GET /api/cover/[imageId] - 获取公开封面详情
 *
 * 返回内容：
 * - 封面图片 URL（带水印预览图）
 * - 提示词
 * - 点赞数
 * - 创建时间
 * - 当前用户是否已点赞（如已登录）
 * - 创作者信息（头像、昵称）
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { imageId } = await params

    if (!imageId) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '请提供有效的图片 ID' },
        { status: 400 },
      )
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
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '封面不存在' },
        { status: 404 },
      )
    }

    // 检查是否公开（或者是用户自己的图片）
    const { userId } = await auth()
    const isOwner = userId && image.user_id === userId

    if (!image.is_public && !isOwner) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '封面不存在或未公开' },
        { status: 404 },
      )
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

    // 返回原图 URL（优化后）
    const rawUrl = image.original_key
      ? getCdnUrl(image.original_key, CDN_DOMAIN)
      : getCdnUrl(image.preview_key, CDN_DOMAIN)
    const imageUrl = getOptimizedImageUrl(rawUrl)

    // generation_tasks is an array from the join, get the first element
    const generationTask = Array.isArray(image.generation_tasks)
      ? image.generation_tasks[0]
      : image.generation_tasks

    return NextResponse.json({
      id: image.id,
      imageUrl,
      prompt: generationTask?.prompt || '',
      likesCount: image.likes_count,
      hasLiked,
      isOwner,
      createdAt: image.created_at,
      creator,
    })
  } catch (error) {
    console.error('Get cover detail error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '获取封面详情失败，请稍后重试' },
      { status: 500 },
    )
  }
}
