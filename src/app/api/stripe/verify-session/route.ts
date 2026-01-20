import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe } from '@/services/stripe'
import { createServiceRoleClient } from '@/supabase/server'
import type { PlanId } from '@/types/database'

interface VerifySessionResponse {
  success: boolean
  credits?: number
  accessLevel?: string
  error?: string
}

/**
 * GET /api/stripe/verify-session
 * 验证支付状态，并作为 webhook 失败时的兜底处理
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<VerifySessionResponse>> {
  try {
    // 验证用户身份
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    // 获取 session_id 参数
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '缺少 session_id 参数' },
        { status: 400 },
      )
    }

    const supabase = createServiceRoleClient()

    // 1. 先查询 payments 记录状态
    const { data: paymentRecord } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    // 2. 如果找到记录且已是 completed，直接返回用户数据
    if (paymentRecord?.status === 'completed') {
      // 验证支付记录属于当前用户
      if (paymentRecord.user_id !== userId) {
        return NextResponse.json(
          { success: false, error: '无权访问此支付记录' },
          { status: 403 },
        )
      }

      const userData = await getUserCredits(supabase, userId)
      return NextResponse.json({
        success: true,
        ...userData,
      })
    }

    // 3. 如果记录不存在或是 pending 状态，需要调用 Stripe 确认支付状态
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // 检查支付状态
    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        error: '支付尚未完成',
      })
    }

    // 验证 session 属于当前用户（从 metadata 中获取）
    const metadata = session.metadata
    if (!metadata || metadata.userId !== userId) {
      return NextResponse.json(
        { success: false, error: '无权访问此支付记录' },
        { status: 403 },
      )
    }

    // 4. 根据记录是否存在，执行不同的兜底处理
    if (paymentRecord?.status === 'pending') {
      // 记录存在且是 pending，更新为 completed
      await processPaymentFallback(
        supabase,
        userId,
        paymentRecord.plan_id as PlanId,
        paymentRecord.credits_added,
        sessionId,
        session.payment_intent as string,
      )
    } else if (!paymentRecord) {
      // 记录不存在（pending 记录创建失败），从 metadata 获取参数创建记录
      const credits = parseInt(metadata.credits || '0', 10)
      const planId = metadata.planId as PlanId

      if (!planId || credits <= 0) {
        return NextResponse.json(
          { success: false, error: '支付数据异常' },
          { status: 400 },
        )
      }

      await processPaymentFallbackWithCreate(
        supabase,
        userId,
        planId,
        credits,
        sessionId,
        session.payment_intent as string,
        session.amount_total || 0,
      )
    } else {
      // 其他状态（如 failed）
      return NextResponse.json({
        success: false,
        error: '支付处理失败',
      })
    }

    // 返回最新用户数据
    const userData = await getUserCredits(supabase, userId)
    return NextResponse.json({
      success: true,
      ...userData,
    })
  } catch (error) {
    console.error('Verify session error:', error)

    return NextResponse.json(
      {
        success: false,
        error: '验证支付状态失败，请稍后重试',
      },
      { status: 500 },
    )
  }
}

/**
 * 获取用户 credits 信息
 */
async function getUserCredits(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string,
) {
  const { data: userData } = await supabase
    .from('users')
    .select('credits, access_level')
    .eq('id', userId)
    .single()

  if (!userData) {
    return {
      credits: 0,
      accessLevel: 'free',
    }
  }

  return {
    credits: userData.credits,
    accessLevel: userData.access_level,
  }
}

/**
 * 兜底处理：更新 pending 记录为 completed
 */
async function processPaymentFallback(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  planId: PlanId,
  credits: number,
  sessionId: string,
  paymentIntentId: string,
): Promise<void> {
  // 更新用户 credits
  await updateUserCredits(supabase, userId, credits)

  // 更新 payment 记录为 completed
  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      provider_transaction_id: paymentIntentId,
      completed_at: new Date().toISOString(),
    })
    .eq('stripe_session_id', sessionId)

  if (paymentError) {
    console.error('Failed to update payment record in fallback:', paymentError)
    // 不抛出错误，用户数据已更新成功
  }

  console.log(
    `Payment fallback (update) completed for user ${userId}: +${credits} credits`,
  )
}

/**
 * 兜底处理：pending 记录不存在时，创建 completed 记录
 */
async function processPaymentFallbackWithCreate(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  planId: PlanId,
  credits: number,
  sessionId: string,
  paymentIntentId: string,
  amount: number,
): Promise<void> {
  // 更新用户 credits
  await updateUserCredits(supabase, userId, credits)

  // 创建 completed 状态的 payment 记录
  const { error: paymentError } = await supabase.from('payments').insert({
    user_id: userId,
    amount: amount,
    status: 'completed',
    provider: 'stripe',
    provider_transaction_id: paymentIntentId,
    stripe_session_id: sessionId,
    plan_id: planId,
    credits_added: credits,
    completed_at: new Date().toISOString(),
  })

  if (paymentError) {
    console.error('Failed to create payment record in fallback:', paymentError)
    // 不抛出错误，用户数据已更新成功
  }

  console.log(
    `Payment fallback (create) completed for user ${userId}: +${credits} credits`,
  )
}

/**
 * 更新用户 credits（累加逻辑，永不过期）
 */
async function updateUserCredits(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  credits: number,
): Promise<void> {
  // 获取当前用户数据
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  if (fetchError || !userData) {
    console.error('Failed to fetch user data in fallback:', fetchError)
    throw new Error('获取用户数据失败')
  }

  // 累加 credits
  const newCredits = userData.credits + credits

  // 更新用户数据（credits 永不过期）
  const { error: updateError } = await supabase
    .from('users')
    .update({
      credits: newCredits,
      access_level: 'premium',
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Failed to update user in fallback:', updateError)
    throw new Error('更新用户数据失败')
  }
}
