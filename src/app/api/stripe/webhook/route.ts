import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/services/stripe'
import { createServiceRoleClient } from '@/supabase/server'
import { getPlan } from '@/config/pricing'
import type { PlanId } from '@/types/database'
import type Stripe from 'stripe'

/**
 * POST /api/stripe/webhook
 * 处理 Stripe Webhook 事件
 */
export async function POST(request: NextRequest) {
  try {
    // 获取原始请求体
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'MISSING_SIGNATURE', message: '缺少签名' },
        { status: 400 },
      )
    }

    // 验证 Webhook 签名
    let event: Stripe.Event
    try {
      event = constructWebhookEvent(payload, signature)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'INVALID_SIGNATURE', message: '签名验证失败' },
        { status: 400 },
      )
    }

    // 处理事件
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      default:
        // 忽略其他事件类型
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)

    return NextResponse.json(
      { error: 'WEBHOOK_ERROR', message: '处理 Webhook 失败' },
      { status: 500 },
    )
  }
}

/**
 * 处理支付完成事件
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata
  if (!metadata) {
    console.error('Missing metadata in checkout session')
    return
  }

  const userId = metadata.userId
  const planId = metadata.planId as PlanId
  const credits = parseInt(metadata.credits || '0', 10)
  const validityDays = parseInt(metadata.validityDays || '0', 10)

  if (!userId || !planId || credits <= 0) {
    console.error('Invalid metadata:', metadata)
    return
  }

  const plan = getPlan(planId)
  const supabase = createServiceRoleClient()

  // 计算过期时间
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + validityDays)

  // 获取当前用户数据
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('credits, credits_expires_at')
    .eq('id', userId)
    .single()

  if (fetchError || !userData) {
    console.error('Failed to fetch user data:', fetchError)
    return
  }

  // 计算新的 credits
  // 如果用户已有 credits 且未过期，则累加；否则使用新购买的 credits
  let newCredits = credits
  let newExpiresAt = expiresAt.toISOString()

  if (userData.credits > 0 && userData.credits_expires_at) {
    const currentExpiry = new Date(userData.credits_expires_at)
    if (currentExpiry > new Date()) {
      // 当前 credits 未过期，累加
      newCredits = userData.credits + credits
      // 过期时间取两者中较晚的
      newExpiresAt =
        currentExpiry > expiresAt
          ? userData.credits_expires_at
          : expiresAt.toISOString()
    }
  }

  // 更新用户数据
  const { error: updateError } = await supabase
    .from('users')
    .update({
      credits: newCredits,
      credits_expires_at: newExpiresAt,
      access_level: 'premium',
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Failed to update user:', updateError)
    return
  }

  // 更新 pending 状态的支付记录为 completed
  const { error: paymentError, count } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      provider_transaction_id: session.payment_intent as string,
      completed_at: new Date().toISOString(),
    })
    .eq('stripe_session_id', session.id)
    .eq('status', 'pending')

  if (paymentError) {
    console.error('Failed to update payment record:', paymentError)
  }

  // 如果没有找到 pending 记录（可能是老订单或创建 pending 记录失败），则创建新记录
  if (count === 0) {
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: userId,
      amount: session.amount_total || plan.price,
      status: 'completed',
      provider: 'stripe',
      provider_transaction_id: session.payment_intent as string,
      stripe_session_id: session.id,
      plan_id: planId,
      credits_added: credits,
      credits_validity_days: validityDays,
      completed_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Failed to create payment record:', insertError)
      return
    }
  }

  console.log(
    `Payment completed for user ${userId}: +${credits} credits, expires at ${newExpiresAt}`,
  )
}
