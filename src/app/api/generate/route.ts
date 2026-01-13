import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getImageProvider } from '@/services/image-generation'
import { createServiceRoleClient } from '@/supabase/server'
import { ensureUserExists } from '@/supabase/auth'
import {
  generateRateLimit,
  getClientIP,
  buildRateLimitResponse,
} from '@/utils/rate-limit'
import { downloadImage, generateImageId } from '@/utils/image-processor'
import { uploadToR2 } from '@/utils/r2-storage'

const ORIGINAL_FOLDER = 'original'

/**
 * 后台异步下载图片并上传到 R2
 * 此函数在响应返回后继续执行，不阻塞用户
 * 数据库记录已经创建，只需下载并上传文件到 R2
 */
async function uploadImageToR2InBackground(params: {
  originalUrl: string
  originalKey: string
  taskId: string
  userId: string
}) {
  const { originalUrl, originalKey, taskId, userId } = params

  try {
    const startTime = Date.now()
    console.log('[Background] 开始后台下载和上传:', originalKey)

    // 1. 下载图片
    const downloadStartTime = Date.now()
    const imageBuffer = await downloadImage(originalUrl)
    console.log(
      '[Background] 下载图片耗时:',
      Date.now() - downloadStartTime,
      'ms',
    )

    // 2. 上传到 R2
    const uploadStartTime = Date.now()
    await uploadToR2(imageBuffer, originalKey)
    console.log(
      '[Background] 上传到 R2 耗时:',
      Date.now() - uploadStartTime,
      'ms',
    )

    console.log(
      '[Background] 后台处理完成，总耗时:',
      Date.now() - startTime,
      'ms',
    )
    console.log('[Background] taskId:', taskId, 'userId:', userId)
  } catch (error) {
    console.error('[Background] 后台处理失败:', error)
    // 注意：这里的错误不会影响已返回给用户的响应
    // 用户已经得到了临时 URL，可以正常使用
  }
}

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

    // 5. 获取图片生成 provider 并生成图片
    // 付费用户关闭水印，免费用户开启水印（API 自带水印）
    const provider = getImageProvider()
    const isPremium = userData.access_level === 'premium'
    const result = await provider.generateImage(prompt, {
      watermark: !isPremium, // 免费用户开启水印，付费用户关闭
    })

    // 6. 在数据库中创建任务记录
    const supabase = createServiceRoleClient()
    const { error: insertError } = await supabase
      .from('generation_tasks')
      .insert({
        user_id: userId,
        provider_task_id: result.taskId,
        prompt: prompt, // 存储原始用户输入，而不是完整 prompt
        status: result.status,
      })

    if (insertError) {
      console.error('Failed to insert task record:', insertError)
      // 不影响用户体验，继续返回结果
    }

    // 7. 如果生成成功，立即返回原始 URL，后台处理上传
    if (result.status === 'SUCCEEDED' && result.originalUrl) {
      const processStartTime = Date.now()
      console.log('[Generate] 立即返回原始 URL，后台处理上传')
      console.log('[Generate] 用户类型:', isPremium ? 'premium' : 'free')

      // 生成图片 ID 和存储 key
      const originalId = generateImageId()
      const originalKey = `${ORIGINAL_FOLDER}/${originalId}.png`

      // 查询任务记录
      const { data: taskData } = await supabase
        .from('generation_tasks')
        .select('id')
        .eq('provider_task_id', result.taskId)
        .eq('user_id', userId)
        .single()

      // 创建图片记录（提前设置 original_key，后台完成实际上传）
      const { data: imageData, error: imageInsertError } = await supabase
        .from('images')
        .insert({
          task_id: taskData?.id,
          user_id: userId,
          original_key: originalKey,
        })
        .select('id')
        .single()

      if (imageInsertError) {
        console.error('Failed to insert image record:', imageInsertError)
      }

      const imageId = imageData?.id || originalId

      // 后台异步处理：下载并上传到 R2
      // 不 await，让它在后台执行
      uploadImageToR2InBackground({
        originalUrl: result.originalUrl,
        originalKey,
        taskId: result.taskId,
        userId,
      }).catch((error) => {
        console.error('[Background Upload] 后台上传失败:', error)
      })

      // 更新任务状态为成功
      await supabase
        .from('generation_tasks')
        .update({
          status: 'SUCCEEDED',
          completed_at: new Date().toISOString(),
        })
        .eq('provider_task_id', result.taskId)
        .eq('user_id', userId)

      console.log(
        '[Generate] 快速响应耗时:',
        Date.now() - processStartTime,
        'ms',
      )

      // 立即返回原始 URL
      return NextResponse.json(
        {
          taskId: result.taskId,
          status: 'SUCCEEDED',
          imageUrl: result.originalUrl,
          imageId,
        },
        { status: 201 },
      )
    }

    // 8. 对于异步 provider 或生成失败，返回任务状态
    // 不直接暴露 provider 的错误消息，使用统一的友好提示
    const responseMessage =
      result.status === 'FAILED' ? '图片生成失败，请稍后重试' : undefined

    // 记录详细错误信息到日志（不返回给用户）
    if (result.status === 'FAILED' && result.errorMessage) {
      console.error('Provider generation failed:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        taskId: result.taskId,
      })
    }

    return NextResponse.json(
      {
        taskId: result.taskId,
        status: result.status,
        ...(result.errorCode && { error: result.errorCode }),
        ...(responseMessage && { message: responseMessage }),
      },
      { status: result.status === 'FAILED' ? 500 : 201 },
    )
  } catch (error) {
    console.error('Create task error:', error)

    let status = 500
    let message = '生成失败，请稍后重试'
    let errorCode = 'SERVER_ERROR'

    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        status = 401
        message = `${error.message}，请稍后重试`
        errorCode = 'AUTH_FAILED'
      } else if (
        error.message.includes('请输入') ||
        error.message.includes('过长')
      ) {
        status = 400
        message = error.message // 这些是用户输入错误，不需要"稍后重试"
        errorCode = 'INVALID_REQUEST'
      } else {
        // 其他未知错误，确保有友好提示
        message = '生成失败，请稍后重试'
      }
    }

    return NextResponse.json({ error: errorCode, message }, { status })
  }
}
