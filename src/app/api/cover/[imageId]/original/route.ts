import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSignedDownloadUrl } from '@/utils/r2-storage'
import { createServiceRoleClient } from '@/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> },
) {
  try {
    const { imageId } = await params

    if (!imageId || typeof imageId !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '无效的图片 ID' },
        { status: 400 },
      )
    }

    // 验证用户身份（使用 Clerk）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    const supabase = createServiceRoleClient()

    // 检查用户是否是 premium 用户
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('access_level')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: '用户不存在' },
        { status: 404 },
      )
    }

    if (userData.access_level !== 'premium') {
      return NextResponse.json(
        { error: 'PAYMENT_REQUIRED', message: '请先购买以获取高清封面' },
        { status: 403 },
      )
    }

    // 从数据库查询图片记录
    const { data: imageData, error: imageError } = await supabase
      .from('images')
      .select('original_key, user_id')
      .eq('id', imageId)
      .single()

    if (imageError || !imageData) {
      return NextResponse.json(
        { error: 'IMAGE_NOT_FOUND', message: '图片不存在或已被删除' },
        { status: 404 },
      )
    }

    // 验证图片所有权（可选：允许 premium 用户访问所有图片，或只能访问自己的）
    // 这里选择只能访问自己的图片
    if (imageData.user_id !== userId) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: '无权访问此图片' },
        { status: 403 },
      )
    }

    // 生成签名 URL
    const signedUrl = await getSignedDownloadUrl(imageData.original_key)

    return NextResponse.json({
      url: signedUrl,
      expiresIn: 600,
    })
  } catch (error) {
    console.error('Get original image error:', error)

    if (
      error instanceof Error &&
      error.message.includes('The specified key does not exist')
    ) {
      return NextResponse.json(
        { error: 'IMAGE_NOT_FOUND', message: '图片不存在或已被删除' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '获取原图失败，请稍后重试' },
      { status: 500 },
    )
  }
}
