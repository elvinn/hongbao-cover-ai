import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'

/**
 * GET /api/user/images - 获取用户的所有图片
 */
export async function GET() {
  try {
    // 验证用户身份（使用 Clerk）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    const supabase = createServiceRoleClient()

    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select(
        `
        id,
        created_at,
        generation_tasks (
          prompt,
          status
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (imagesError) {
      console.error('Failed to fetch images:', imagesError)
      return NextResponse.json(
        { error: 'FETCH_FAILED', message: '获取图片列表失败' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      images: images || [],
    })
  } catch (error) {
    console.error('Get images error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '获取图片列表失败，请稍后重试' },
      { status: 500 },
    )
  }
}
