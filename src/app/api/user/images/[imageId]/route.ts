import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'

interface RouteParams {
  params: Promise<{ imageId: string }>
}

/**
 * PATCH /api/user/images/[imageId] - 更新图片属性（如公开状态）
 *
 * Body:
 * - is_public: boolean (可选)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json()
    const { is_public } = body

    if (typeof is_public !== 'boolean') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '请提供有效的参数' },
        { status: 400 },
      )
    }

    const supabase = createServiceRoleClient()

    // 验证图片属于当前用户
    const { data: image, error: fetchError } = await supabase
      .from('images')
      .select('id, user_id')
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '图片不存在' },
        { status: 404 },
      )
    }

    if (image.user_id !== userId) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: '无权操作此图片' },
        { status: 403 },
      )
    }

    // 更新图片公开状态
    const { error: updateError } = await supabase
      .from('images')
      .update({ is_public })
      .eq('id', imageId)

    if (updateError) {
      console.error('Failed to update image:', updateError)
      return NextResponse.json(
        { error: 'UPDATE_FAILED', message: '更新失败，请稍后重试' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      is_public,
    })
  } catch (error) {
    console.error('Update image error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '更新失败，请稍后重试' },
      { status: 500 },
    )
  }
}
