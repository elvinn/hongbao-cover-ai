import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import { ensureUserExists } from '@/supabase/auth'

// 支付金额（分）
const PAYMENT_AMOUNT = 399

// 支付成功后增加的 credits
const CREDITS_TO_ADD = 1

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

    const supabase = createServiceRoleClient()

    // 确保用户存在并获取当前用户信息
    const userData = await ensureUserExists(userId)

    // 创建支付记录
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: PAYMENT_AMOUNT,
        status: 'completed', // Mock: 直接设为完成
        provider: 'mock',
        provider_transaction_id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        credits_added: CREDITS_TO_ADD,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError)
      return NextResponse.json(
        { error: 'PAYMENT_FAILED', message: '支付记录创建失败' },
        { status: 500 },
      )
    }

    // 更新用户信息
    const { error: updateError } = await supabase
      .from('users')
      .update({
        access_level: 'premium',
        credits: userData.credits + CREDITS_TO_ADD,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update user:', updateError)
      // 回滚支付记录状态
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', paymentData.id)

      return NextResponse.json(
        { error: 'UPDATE_FAILED', message: '用户信息更新失败' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentData.id,
      creditsAdded: CREDITS_TO_ADD,
      newCredits: userData.credits + CREDITS_TO_ADD,
      accessLevel: 'premium',
    })
  } catch (error) {
    console.error('Payment error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '支付处理失败，请稍后重试' },
      { status: 500 },
    )
  }
}

// 获取支付记录
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

    // 获取用户的支付记录
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('Failed to fetch payments:', paymentsError)
      return NextResponse.json(
        { error: 'FETCH_FAILED', message: '获取支付记录失败' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      payments: payments || [],
    })
  } catch (error) {
    console.error('Get payments error:', error)

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: '获取支付记录失败，请稍后重试' },
      { status: 500 },
    )
  }
}
