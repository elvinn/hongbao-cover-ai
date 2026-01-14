import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
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

    // 使用 service role client
    const supabase = createServiceRoleClient()

    // 确保用户存在并获取数据
    const userData = await ensureUserExists(userId)

    // 检查 credits 是否过期
    let effectiveCredits = userData.credits
    let creditsExpiresAt = userData.credits_expires_at
    if (creditsExpiresAt && new Date(creditsExpiresAt) < new Date()) {
      // Credits 已过期，清零（但保留 access_level）
      effectiveCredits = 0
      creditsExpiresAt = null
      // 异步更新数据库中的 credits
      await supabase
        .from('users')
        .update({ credits: 0, credits_expires_at: null })
        .eq('id', userId)
    }

    return NextResponse.json({
      credits: effectiveCredits,
      creditsExpiresAt: creditsExpiresAt,
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
