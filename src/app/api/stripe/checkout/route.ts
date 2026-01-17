import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getStripe } from '@/services/stripe'
import { getPlan, PRICING_PLANS } from '@/config/pricing'
import { createServiceRoleClient } from '@/supabase/server'
import type { PlanId } from '@/types/database'
import {
  checkoutRateLimit,
  getClientIP,
  buildRateLimitResponse,
} from '@/utils/rate-limit'

interface CheckoutRequestBody {
  planId: PlanId
}

/**
 * POST /api/stripe/checkout
 * 创建 Stripe Checkout Session
 */
export async function POST(request: NextRequest) {
  try {
    // 限频检查
    const ip = getClientIP(request)
    const { success, remaining, reset } = await checkoutRateLimit.limit(ip)

    if (!success) {
      const response = buildRateLimitResponse(reset, remaining)
      return NextResponse.json(response.body, {
        status: response.status,
        headers: response.headers,
      })
    }

    // 验证用户身份（使用 Clerk）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    // 获取用户邮箱
    const user = await currentUser()
    const userEmail = user?.emailAddresses?.[0]?.emailAddress

    // 解析请求体
    const body = (await request.json()) as CheckoutRequestBody
    const { planId } = body

    // 验证套餐 ID
    if (!planId || !PRICING_PLANS[planId]) {
      return NextResponse.json(
        { error: 'INVALID_PLAN', message: '无效的套餐' },
        { status: 400 },
      )
    }

    const plan = getPlan(planId)
    const stripe = getStripe()

    // 获取基础 URL
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000'

    // 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['alipay', 'wechat_pay', 'card'],
      payment_method_options: {
        wechat_pay: {
          client: 'web',
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'cny',
            product_data: {
              name: `红包封面 AI - ${plan.name}`,
              description: `${plan.credits} 次生成机会，${plan.validityDisplay}有效`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        planId: planId,
        credits: plan.credits.toString(),
        validityDays: plan.validityDays.toString(),
      },
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      customer_email: userEmail,
    })

    // 创建 pending 状态的 payments 记录
    const supabase = createServiceRoleClient()
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: userId,
      amount: plan.price,
      status: 'pending',
      provider: 'stripe',
      stripe_session_id: session.id,
      plan_id: planId,
      credits_added: plan.credits,
      credits_validity_days: plan.validityDays,
    })

    if (paymentError) {
      console.error('Failed to create pending payment record:', paymentError)
      // 不阻塞支付流程，继续返回 session URL
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)

    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        return NextResponse.json(
          { error: 'CONFIG_ERROR', message: 'Stripe 配置错误' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '创建支付会话失败，请稍后重试' },
      { status: 500 },
    )
  }
}
