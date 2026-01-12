import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import { ensureUserExists } from '@/supabase/auth'

type CreditAction = 'consume' | 'add' | 'increment_generation'

interface CreditRequestBody {
  action: CreditAction
  amount?: number
}

/**
 * POST /api/user/credits
 * 安全地消耗或增加用户 credits
 *
 * 请求体：
 * - action: 'consume' | 'add'
 * - amount?: number (仅 'add' 时使用，默认为 1)
 *
 * 响应：
 * - credits: number (更新后的 credits)
 * - success: boolean
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份（使用 Clerk）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    // 解析请求体
    const body = (await request.json()) as CreditRequestBody
    const { action, amount = 1 } = body

    if (
      !action ||
      !['consume', 'add', 'increment_generation'].includes(action)
    ) {
      return NextResponse.json(
        { error: 'INVALID_ACTION', message: '无效的操作类型' },
        { status: 400 },
      )
    }

    if (
      action !== 'increment_generation' &&
      (typeof amount !== 'number' || amount < 1)
    ) {
      return NextResponse.json(
        { error: 'INVALID_AMOUNT', message: '无效的数量' },
        { status: 400 },
      )
    }

    // 使用 service role client
    const supabase = createServiceRoleClient()

    // 确保用户存在并获取当前用户数据
    const userData = await ensureUserExists(userId)

    // 检查 credits 是否过期
    let effectiveCredits = userData.credits
    let creditsExpired = false
    if (
      userData.credits_expires_at &&
      new Date(userData.credits_expires_at) < new Date()
    ) {
      // Credits 已过期，清零（但保留 access_level）
      effectiveCredits = 0
      creditsExpired = true
      // 异步更新数据库中的 credits
      await supabase
        .from('users')
        .update({ credits: 0, credits_expires_at: null })
        .eq('id', userId)
    }

    // 处理不同的操作
    if (action === 'increment_generation') {
      // 增加生成计数
      const newGenerationCount = userData.generation_count + 1
      const { error: updateError } = await supabase
        .from('users')
        .update({ generation_count: newGenerationCount })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to increment generation count:', updateError)
        return NextResponse.json(
          { error: 'UPDATE_FAILED', message: '更新失败' },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        generationCount: newGenerationCount,
        action,
      })
    }

    // 处理 credits 操作
    let newCredits: number

    if (action === 'consume') {
      if (effectiveCredits < 1) {
        return NextResponse.json(
          {
            error: 'INSUFFICIENT_CREDITS',
            message: creditsExpired
              ? '生成次数已过期，请购买新套餐'
              : '生成次数不足',
          },
          { status: 400 },
        )
      }
      newCredits = effectiveCredits - 1
    } else {
      // action === 'add'
      newCredits = effectiveCredits + amount
    }

    // 更新 credits
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update credits:', updateError)
      return NextResponse.json(
        { error: 'UPDATE_FAILED', message: '更新失败' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      credits: newCredits,
      action,
      amount: action === 'consume' ? 1 : amount,
    })
  } catch (error) {
    console.error('Credits API error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '操作失败，请稍后重试' },
      { status: 500 },
    )
  }
}

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
