import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import { ensureUserExists } from '@/supabase/auth'
import type { RedemptionResult } from '@/config/redemption'

/**
 * POST /api/redeem
 * 兑换码兑换
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
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '请输入有效的兑换码' },
        { status: 400 },
      )
    }

    // 清理兑换码（去除空格，转大写）
    const cleanCode = code.trim().toUpperCase()

    if (cleanCode.length === 0) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '请输入有效的兑换码' },
        { status: 400 },
      )
    }

    const supabase = createServiceRoleClient()

    // 查询兑换码
    const { data: redemptionCode, error: fetchError } = await supabase
      .from('redemption_codes')
      .select('*')
      .eq('code', cleanCode)
      .single()

    if (fetchError || !redemptionCode) {
      return NextResponse.json(
        { error: 'CODE_NOT_FOUND', message: '兑换码不存在' },
        { status: 404 },
      )
    }

    // 检查是否已被使用
    if (redemptionCode.is_used) {
      return NextResponse.json(
        { error: 'CODE_ALREADY_USED', message: '该兑换码已被使用' },
        { status: 400 },
      )
    }

    // 检查兑换码是否过期
    if (
      redemptionCode.expires_at &&
      new Date(redemptionCode.expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: 'CODE_EXPIRED', message: '该兑换码已过期' },
        { status: 400 },
      )
    }

    // 确保用户存在
    const userData = await ensureUserExists(userId)

    // 计算新的 credits
    const creditsToAdd = redemptionCode.credits_amount
    const newCredits = userData.credits + creditsToAdd

    // 使用事务更新（先更新兑换码，再更新用户）
    // 1. 标记兑换码为已使用
    const { error: updateCodeError } = await supabase
      .from('redemption_codes')
      .update({
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', redemptionCode.id)
      .eq('is_used', false) // 乐观锁，防止并发

    if (updateCodeError) {
      console.error('Failed to update redemption code:', updateCodeError)
      return NextResponse.json(
        { error: 'REDEEM_FAILED', message: '兑换失败，请稍后重试' },
        { status: 500 },
      )
    }

    // 2. 更新用户数据
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        credits: newCredits,
        access_level: 'premium',
      })
      .eq('id', userId)

    if (updateUserError) {
      console.error('Failed to update user:', updateUserError)
      // 尝试回滚兑换码状态
      await supabase
        .from('redemption_codes')
        .update({
          is_used: false,
          used_by: null,
          used_at: null,
        })
        .eq('id', redemptionCode.id)

      return NextResponse.json(
        { error: 'REDEEM_FAILED', message: '兑换失败，请稍后重试' },
        { status: 500 },
      )
    }

    const result: RedemptionResult = {
      success: true,
      creditsAdded: creditsToAdd,
      newCredits: newCredits,
      message: `兑换成功！获得 ${creditsToAdd} 次生成机会`,
    }

    console.log(
      `Redemption completed for user ${userId}: code=${cleanCode}, +${creditsToAdd} credits, total=${newCredits}`,
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Redemption error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '兑换失败，请稍后重试' },
      { status: 500 },
    )
  }
}
