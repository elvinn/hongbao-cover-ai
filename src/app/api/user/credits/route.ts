import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ensureUserExists } from '@/supabase/auth'

/**
 * GET /api/user/credits
 * 获取当前用户的 credits
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

    // 确保用户存在并获取数据
    const userData = await ensureUserExists(userId)

    return NextResponse.json({
      credits: userData.credits,
      accessLevel: userData.access_level,
      generationCount: userData.generation_count,
    })
  } catch (error) {
    console.error('Get credits error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '获取信息失败，请稍后重试' },
      { status: 500 },
    )
  }
}
