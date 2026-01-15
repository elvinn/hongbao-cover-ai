import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'

interface RouteParams {
  params: Promise<{ imageId: string }>
}

/**
 * POST /api/cover/[imageId]/like - 点赞封面
 *
 * 需要登录，点赞后同步更新 images.likes_count
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    const { imageId } = await params

    if (!imageId) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '请提供有效的图片 ID' },
        { status: 400 },
      )
    }

    const supabase = createServiceRoleClient()

    // 检查图片是否存在且公开
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('id, is_public, user_id, likes_count')
      .eq('id', imageId)
      .single()

    if (imageError || !image) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '封面不存在' },
        { status: 404 },
      )
    }

    // 只有公开的图片或自己的图片才能点赞
    if (!image.is_public && image.user_id !== userId) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '封面不存在或未公开' },
        { status: 404 },
      )
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('image_likes')
      .select('id')
      .eq('image_id', imageId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      return NextResponse.json(
        { error: 'ALREADY_LIKED', message: '已经点赞过了' },
        { status: 400 },
      )
    }

    // 创建点赞记录
    const { error: likeError } = await supabase.from('image_likes').insert({
      image_id: imageId,
      user_id: userId,
    })

    if (likeError) {
      console.error('Failed to create like:', likeError)
      return NextResponse.json(
        { error: 'LIKE_FAILED', message: '点赞失败，请稍后重试' },
        { status: 500 },
      )
    }

    // 更新点赞计数
    const { error: updateError } = await supabase
      .from('images')
      .update({ likes_count: image.likes_count + 1 })
      .eq('id', imageId)

    if (updateError) {
      console.error('Failed to update likes count:', updateError)
      // 点赞记录已创建，计数更新失败不影响用户体验
    }

    return NextResponse.json({
      success: true,
      likesCount: image.likes_count + 1,
    })
  } catch (error) {
    console.error('Like cover error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '点赞失败，请稍后重试' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/cover/[imageId]/like - 取消点赞
 *
 * 需要登录，取消点赞后同步更新 images.likes_count
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    const { imageId } = await params

    if (!imageId) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '请提供有效的图片 ID' },
        { status: 400 },
      )
    }

    const supabase = createServiceRoleClient()

    // 检查图片是否存在
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('id, likes_count')
      .eq('id', imageId)
      .single()

    if (imageError || !image) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '封面不存在' },
        { status: 404 },
      )
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('image_likes')
      .select('id')
      .eq('image_id', imageId)
      .eq('user_id', userId)
      .single()

    if (!existingLike) {
      return NextResponse.json(
        { error: 'NOT_LIKED', message: '尚未点赞' },
        { status: 400 },
      )
    }

    // 删除点赞记录
    const { error: deleteError } = await supabase
      .from('image_likes')
      .delete()
      .eq('image_id', imageId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Failed to delete like:', deleteError)
      return NextResponse.json(
        { error: 'UNLIKE_FAILED', message: '取消点赞失败，请稍后重试' },
        { status: 500 },
      )
    }

    // 更新点赞计数
    const newCount = Math.max(0, image.likes_count - 1)
    const { error: updateError } = await supabase
      .from('images')
      .update({ likes_count: newCount })
      .eq('id', imageId)

    if (updateError) {
      console.error('Failed to update likes count:', updateError)
    }

    return NextResponse.json({
      success: true,
      likesCount: newCount,
    })
  } catch (error) {
    console.error('Unlike cover error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '取消点赞失败，请稍后重试' },
      { status: 500 },
    )
  }
}
