import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createTask } from '@/services/alibaba-image'
import { buildFullPrompt } from '@/utils/prompts'
import { createServiceRoleClient } from '@/supabase/server'
import { ensureUserExists } from '@/supabase/auth'
import {
  generateRateLimit,
  getClientIP,
  buildRateLimitResponse,
} from '@/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // 0. 限频检查（放在最前面，减少不必要的处理）
    const ip = getClientIP(request)
    const { success, remaining, reset } = await generateRateLimit.limit(ip)

    if (!success) {
      const response = buildRateLimitResponse(reset, remaining)
      return NextResponse.json(response.body, {
        status: response.status,
        headers: response.headers,
      })
    }

    // 1. 验证用户身份（使用 Clerk）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 },
      )
    }

    // 2. 确保用户存在于数据库中
    const userData = await ensureUserExists(userId)

    // 3. 检查用户是否有足够的 credits
    if (userData.credits <= 0) {
      return NextResponse.json(
        {
          error: 'NO_CREDITS',
          message: '生成次数已用完，请购买解锁更多次数',
          credits: userData.credits,
        },
        { status: 403 },
      )
    }

    // 4. 解析请求
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '请提供有效的 prompt' },
        { status: 400 },
      )
    }

    // 5. 构建完整 prompt 并创建文生图任务
    const fullPrompt = buildFullPrompt(prompt)
    const result = await createTask(fullPrompt)

    // 6. 在数据库中创建任务记录
    const supabase = createServiceRoleClient()
    const { error: insertError } = await supabase
      .from('generation_tasks')
      .insert({
        user_id: userId,
        provider_task_id: result.taskId,
        prompt: prompt, // 存储原始用户输入，而不是完整 prompt
        status: result.initialStatus,
      })

    if (insertError) {
      console.error('Failed to insert task record:', insertError)
      // 不影响用户体验，继续返回结果
    }

    return NextResponse.json(
      {
        taskId: result.taskId,
        requestId: result.requestId,
        status: result.initialStatus,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Create task error:', error)

    let status = 500
    let message = '创建任务失败，请稍后重试'
    let errorCode = 'SERVER_ERROR'

    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        status = 401
        message = error.message
        errorCode = 'AUTH_FAILED'
      } else if (
        error.message.includes('请输入') ||
        error.message.includes('过长')
      ) {
        status = 400
        message = error.message
        errorCode = 'INVALID_REQUEST'
      }
    }

    return NextResponse.json({ error: errorCode, message }, { status })
  }
}
