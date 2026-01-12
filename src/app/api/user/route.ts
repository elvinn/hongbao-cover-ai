import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import { ensureUserExists } from '@/supabase/auth'

/**
 * GET /api/user - 获取当前用户信息
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

    // 确保用户存在并获取用户数据
    const userData = await ensureUserExists(userId)

    return NextResponse.json({
      id: userData.id,
      credits: userData.credits,
      creditsExpiresAt: userData.credits_expires_at,
      accessLevel: userData.access_level,
      generationCount: userData.generation_count,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    })
  } catch (error) {
    console.error('Get user error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '获取用户信息失败，请稍后重试' },
      { status: 500 },
    )
  }
}
